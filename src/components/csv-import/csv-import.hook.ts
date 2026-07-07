import {
  downloadCsv,
  generateCsvTemplate,
  parseCsvContent,
} from '@/utils/csv';
import { fetchFormResources } from '@/services/form-resources.service';
import type { ResourceKey } from '@/services/form-resources.service';
import { useCallback, useRef, useState } from 'react';
import { v4 as uuid } from 'uuid';
import {
  getReferenceOptions,
  resolveRowReferences,
} from './csv-import.references';
import type {
  CsvColumnConfig,
  CsvImportConfig,
  CsvImportModalProps,
  CsvImportStep,
  CsvReferenceConfig,
  ImportRow,
  ImportRowStatus,
} from './csv-import.types';

function createEmptyRow<T extends Record<string, unknown>>(
  columns: CsvColumnConfig<T>[],
): T {
  return columns.reduce(
    (acc, col) => ({ ...acc, [col.key]: '' }),
    {} as T,
  );
}

function mapCsvToRows<T extends Record<string, unknown>>(
  parsed: string[][],
  columns: CsvColumnConfig<T>[],
): ImportRow<T>[] {
  if (parsed.length === 0) return [];

  const [headerRow, ...dataRows] = parsed;
  const headerMap = new Map<string, keyof T & string>();

  columns.forEach((col) => {
    const headerIndex = headerRow.findIndex(
      (h) => h.trim().toLowerCase() === col.header.trim().toLowerCase(),
    );
    if (headerIndex >= 0) {
      headerMap.set(String(headerIndex), col.key);
    }
  });

  const missingRequired = columns
    .filter((c) => c.required)
    .filter(
      (c) =>
        !headerRow.some(
          (h) => h.trim().toLowerCase() === c.header.trim().toLowerCase(),
        ),
    );

  if (missingRequired.length > 0) {
    throw new Error(
      `Colunas obrigatórias ausentes: ${missingRequired.map((c) => c.header).join(', ')}`,
    );
  }

  return dataRows
    .filter((row) => row.some((cell) => cell.trim() !== ''))
    .map((row, index) => {
      const data = createEmptyRow(columns);

      headerMap.forEach((key, colIndex) => {
        (data as Record<string, string>)[key] = row[Number(colIndex)] ?? '';
      });

      return {
        id: uuid(),
        lineNumber: index + 2,
        data,
        status: 'pending' as ImportRowStatus,
        resolvedIds: {},
        unresolvedRefs: [],
      };
    });
}

async function validateRow<T extends Record<string, unknown>>(
  row: ImportRow<T>,
  schema: CsvImportConfig<T, unknown>['schema'],
  references?: CsvReferenceConfig[],
): Promise<ImportRow<T>> {
  const missingRequiredRefs =
    references?.filter(
      (ref) =>
        ref.required &&
        !row.resolvedIds?.[ref.targetKey] &&
        String(row.data[ref.csvKey as keyof T] ?? '').trim(),
    ) ?? [];

  if (missingRequiredRefs.length > 0) {
    return {
      ...row,
      status: 'validation_error',
      error: `Selecione manualmente: ${missingRequiredRefs.map((r) => r.label).join(', ')}`,
      unresolvedRefs: [
        ...new Set([
          ...(row.unresolvedRefs ?? []),
          ...missingRequiredRefs.map((r) => r.csvKey),
        ]),
      ],
    };
  }

  try {
    const validated = (await schema.validate(row.data, {
      abortEarly: false,
    })) as T;
    return {
      ...row,
      data: validated,
      status: 'pending' as ImportRowStatus,
      error: undefined,
    };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Dados inválidos';
    return {
      ...row,
      status: 'validation_error' as ImportRowStatus,
      error: message,
    };
  }
}

function buildPayload<TImport extends Record<string, unknown>, TPayload>(
  row: ImportRow<TImport>,
  config: CsvImportConfig<TImport, TPayload>,
): TPayload {
  const resolvedIds = row.resolvedIds ?? {};

  if (config.mapRow) {
    return config.mapRow(row.data, resolvedIds);
  }

  return { ...row.data, ...resolvedIds } as TPayload;
}

function extractErrorMessage(err: unknown): string {
  if (typeof err === 'object' && err !== null && 'response' in err) {
    const response = (
      err as { response?: { data?: { message?: string | string[] } } }
    ).response;
    const msg = response?.data?.message;
    if (typeof msg === 'string') return msg;
    if (Array.isArray(msg) && msg[0]) return msg[0];
  }
  if (err instanceof Error) return err.message;
  return 'Erro ao cadastrar registro.';
}

export function useCsvImport<
  TImport extends Record<string, unknown>,
  TPayload = TImport,
>(props: CsvImportModalProps<TImport, TPayload>) {
  const { config, onClose, onComplete } = props;
  const [step, setStep] = useState<CsvImportStep>('upload');
  const [rows, setRows] = useState<ImportRow<TImport>[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [resourcesLoading, setResourcesLoading] = useState(false);
  const [resourceOptions, setResourceOptions] = useState<
    Partial<Record<ResourceKey, { value: string; label: string }[]>>
  >({});
  const abortRef = useRef(false);
  const rowsRef = useRef(rows);
  rowsRef.current = rows;

  const references = config.references ?? [];

  const reset = useCallback(() => {
    abortRef.current = true;
    setStep('upload');
    setRows([]);
    setParseError(null);
    setProcessing(false);
    setResourcesLoading(false);
    setResourceOptions({});
  }, []);

  const handleClose = useCallback(() => {
    reset();
    onClose();
  }, [onClose, reset]);

  const handleDownloadTemplate = useCallback(() => {
    const headers = config.columns.map((c) => c.header);
    const exampleRow = config.columns.map((c) => c.example ?? '');
    const hasExample = exampleRow.some((v) => v !== '');
    const content = generateCsvTemplate(
      headers,
      hasExample ? exampleRow : undefined,
    );
    downloadCsv(
      content,
      `modelo_${config.entityLabel.replace(/\s+/g, '_')}.csv`,
    );
  }, [config]);

  const handleFileSelect = useCallback(
    async (file: File) => {
      setParseError(null);
      setResourcesLoading(true);

      try {
        const text = await file.text();
        const parsed = parseCsvContent(text);
        const mapped = mapCsvToRows(parsed, config.columns);

        if (mapped.length === 0) {
          setParseError('O arquivo CSV não contém linhas de dados.');
          return;
        }

        let resolvedRows = mapped;

        if (references.length > 0) {
          const resourceKeys = [
            ...new Set(references.map((ref) => ref.resourceKey)),
          ] as ResourceKey[];
          const resources = await fetchFormResources({
            resources: resourceKeys,
          });

          const options: Partial<
            Record<ResourceKey, { value: string; label: string }[]>
          > = {};
          for (const key of resourceKeys) {
            options[key] = getReferenceOptions(resources, key);
          }
          setResourceOptions(options);

          resolvedRows = mapped.map((row) => {
            const { resolvedIds, unresolvedRefs } = resolveRowReferences(
              row.data,
              references,
              resources,
            );
            return { ...row, resolvedIds, unresolvedRefs };
          });
        }

        const validated = await Promise.all(
          resolvedRows.map((row) =>
            validateRow(row, config.schema, references),
          ),
        );

        setRows(validated);
        setStep('preview');
      } catch (err) {
        setParseError(
          err instanceof Error ? err.message : 'Erro ao ler o arquivo CSV.',
        );
      } finally {
        setResourcesLoading(false);
      }
    },
    [config, references],
  );

  const updateRowData = useCallback(
    (rowId: string, key: keyof TImport & string, value: string) => {
      setRows((prev) =>
        prev.map((row) =>
          row.id === rowId
            ? {
                ...row,
                data: { ...row.data, [key]: value },
                status:
                  row.status === 'error' || row.status === 'validation_error'
                    ? 'pending'
                    : row.status,
                error: undefined,
              }
            : row,
        ),
      );
    },
    [],
  );

  const updateReferenceSelection = useCallback(
    (rowId: string, ref: CsvReferenceConfig, selectedId: string) => {
      setRows((prev) =>
        prev.map((row) => {
          if (row.id !== rowId) return row;

          const resolvedIds = {
            ...(row.resolvedIds ?? {}),
            [ref.targetKey]: selectedId || undefined,
          };
          const unresolvedRefs = selectedId
            ? (row.unresolvedRefs ?? []).filter((key) => key !== ref.csvKey)
            : [...new Set([...(row.unresolvedRefs ?? []), ref.csvKey])];

          return {
            ...row,
            resolvedIds,
            unresolvedRefs,
            status: 'pending' as ImportRowStatus,
            error: undefined,
          };
        }),
      );
    },
    [],
  );

  const processQueue = useCallback(
    async (rowIds: string[]) => {
      abortRef.current = false;
      setProcessing(true);
      setStep('processing');

      let hasSuccess = false;

      for (const rowId of rowIds) {
        if (abortRef.current) break;

        setRows((prev) =>
          prev.map((r) =>
            r.id === rowId
              ? { ...r, status: 'processing', error: undefined }
              : r,
          ),
        );

        const currentRow = rowsRef.current.find((r) => r.id === rowId);
        if (!currentRow) continue;

        const validated = await validateRow(
          currentRow,
          config.schema,
          references,
        );
        if (validated.status === 'validation_error') {
          setRows((prev) => {
            const next = prev.map((r) => (r.id === rowId ? validated : r));
            rowsRef.current = next;
            return next;
          });
          continue;
        }

        try {
          const payload = buildPayload(validated, config);
          await config.onCreate(payload);
          hasSuccess = true;
          setRows((prev) => {
            const next = prev.map((r) =>
              r.id === rowId
                ? { ...r, status: 'success' as ImportRowStatus, error: undefined }
                : r,
            );
            rowsRef.current = next;
            return next;
          });
        } catch (err) {
          const message = extractErrorMessage(err);
          setRows((prev) => {
            const next = prev.map((r) =>
              r.id === rowId
                ? { ...r, status: 'error' as ImportRowStatus, error: message }
                : r,
            );
            rowsRef.current = next;
            return next;
          });
        }
      }

      setProcessing(false);
      setStep('results');

      if (hasSuccess) {
        onComplete?.();
      }
    },
    [config, onComplete, references],
  );

  const handleStartImport = useCallback(() => {
    const importable = rows.filter(
      (r) => r.status === 'pending' || r.status === 'validation_error',
    );
    processQueue(importable.map((r) => r.id));
  }, [processQueue, rows]);

  const handleRetryRow = useCallback(
    (rowId: string) => {
      processQueue([rowId]);
    },
    [processQueue],
  );

  const handleRetryAllErrors = useCallback(() => {
    const errorIds = rows
      .filter((r) => r.status === 'error' || r.status === 'validation_error')
      .map((r) => r.id);
    processQueue(errorIds);
  }, [processQueue, rows]);

  const unresolvedRequiredCount = rows.filter((row) =>
    references.some(
      (ref) =>
        ref.required &&
        (row.unresolvedRefs?.includes(ref.csvKey) ||
          (String(row.data[ref.csvKey as keyof TImport] ?? '').trim() &&
            !row.resolvedIds?.[ref.targetKey])),
    ),
  ).length;

  const stats = {
    total: rows.length,
    pending: rows.filter((r) => r.status === 'pending').length,
    success: rows.filter((r) => r.status === 'success').length,
    error: rows.filter(
      (r) => r.status === 'error' || r.status === 'validation_error',
    ).length,
    validationError: rows.filter((r) => r.status === 'validation_error').length,
    unresolvedRequired: unresolvedRequiredCount,
  };

  const canStartImport =
    rows.length > 0 &&
    rows.some((r) => r.status === 'pending' || r.status === 'validation_error') &&
    unresolvedRequiredCount === 0;

  return {
    step,
    rows,
    parseError,
    processing,
    resourcesLoading,
    resourceOptions,
    references,
    stats,
    canStartImport,
    handleClose,
    handleDownloadTemplate,
    handleFileSelect,
    updateRowData,
    updateReferenceSelection,
    handleStartImport,
    handleRetryRow,
    handleRetryAllErrors,
    setStep,
  };
}
