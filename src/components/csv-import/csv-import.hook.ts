import {
  downloadCsv,
  generateCsvTemplate,
  parseCsvContent,
} from '@/utils/csv';
import { useCallback, useRef, useState } from 'react';
import { v4 as uuid } from 'uuid';
import type {
  CsvImportConfig,
  CsvImportModalProps,
  CsvImportStep,
  ImportRow,
  ImportRowStatus,
} from './csv-import.types';

function createEmptyRow<T extends Record<string, unknown>>(
  columns: CsvImportConfig<T>['columns'],
): T {
  return columns.reduce(
    (acc, col) => ({ ...acc, [col.key]: '' }),
    {} as T,
  );
}

function mapCsvToRows<T extends Record<string, unknown>>(
  parsed: string[][],
  config: CsvImportConfig<T>,
): ImportRow<T>[] {
  if (parsed.length === 0) return [];

  const [headerRow, ...dataRows] = parsed;
  const headerMap = new Map<string, keyof T & string>();

  config.columns.forEach((col) => {
    const headerIndex = headerRow.findIndex(
      (h) => h.trim().toLowerCase() === col.header.trim().toLowerCase(),
    );
    if (headerIndex >= 0) {
      headerMap.set(String(headerIndex), col.key);
    }
  });

  const missingRequired = config.columns
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
      const data = createEmptyRow(config.columns);

      headerMap.forEach((key, colIndex) => {
        (data as Record<string, string>)[key] = row[Number(colIndex)] ?? '';
      });

      return {
        id: uuid(),
        lineNumber: index + 2,
        data,
        status: 'pending' as ImportRowStatus,
      };
    });
}

async function validateRow<T extends Record<string, unknown>>(
  row: ImportRow<T>,
  schema: CsvImportConfig<T>['schema'],
): Promise<ImportRow<T>> {
  try {
    const validated = (await schema.validate(row.data, {
      abortEarly: false,
    })) as T;
    return { ...row, data: validated, status: 'pending' as ImportRowStatus, error: undefined };
  } catch (err) {
    const message =
      err instanceof Error
        ? err.message
        : 'Dados inválidos';
    return { ...row, status: 'validation_error' as ImportRowStatus, error: message };
  }
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

export function useCsvImport<T extends Record<string, unknown>>(
  props: CsvImportModalProps<T>,
) {
  const { config, onClose, onComplete } = props;
  const [step, setStep] = useState<CsvImportStep>('upload');
  const [rows, setRows] = useState<ImportRow<T>[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const abortRef = useRef(false);
  const rowsRef = useRef(rows);
  rowsRef.current = rows;

  const reset = useCallback(() => {
    abortRef.current = true;
    setStep('upload');
    setRows([]);
    setParseError(null);
    setProcessing(false);
  }, []);

  const handleClose = useCallback(() => {
    reset();
    onClose();
  }, [onClose, reset]);

  const handleDownloadTemplate = useCallback(() => {
    const headers = config.columns.map((c) => c.header);
    const exampleRow = config.columns.map((c) => c.example ?? '');
    const hasExample = exampleRow.some((v) => v !== '');
    const content = generateCsvTemplate(headers, hasExample ? exampleRow : undefined);
    downloadCsv(content, `modelo_${config.entityLabel.replace(/\s+/g, '_')}.csv`);
  }, [config]);

  const handleFileSelect = useCallback(
    async (file: File) => {
      setParseError(null);
      try {
        const text = await file.text();
        const parsed = parseCsvContent(text);
        const mapped = mapCsvToRows(parsed, config);

        if (mapped.length === 0) {
          setParseError('O arquivo CSV não contém linhas de dados.');
          return;
        }

        const validated = await Promise.all(
          mapped.map((row) => validateRow(row, config.schema)),
        );

        setRows(validated);
        setStep('preview');
      } catch (err) {
        setParseError(
          err instanceof Error ? err.message : 'Erro ao ler o arquivo CSV.',
        );
      }
    },
    [config],
  );

  const updateRowData = useCallback(
    (rowId: string, key: keyof T & string, value: string) => {
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
            r.id === rowId ? { ...r, status: 'processing', error: undefined } : r,
          ),
        );

        const currentRow = rowsRef.current.find((r) => r.id === rowId);
        if (!currentRow) continue;

        const validated = await validateRow(currentRow, config.schema);
        if (validated.status === 'validation_error') {
          setRows((prev) => {
            const next = prev.map((r) => (r.id === rowId ? validated : r));
            rowsRef.current = next;
            return next;
          });
          continue;
        }

        try {
          await config.onCreate(validated.data);
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
    [config, onComplete],
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

  const stats = {
    total: rows.length,
    pending: rows.filter((r) => r.status === 'pending').length,
    success: rows.filter((r) => r.status === 'success').length,
    error: rows.filter(
      (r) => r.status === 'error' || r.status === 'validation_error',
    ).length,
    validationError: rows.filter((r) => r.status === 'validation_error').length,
  };

  const canStartImport =
    rows.length > 0 &&
    rows.some((r) => r.status === 'pending' || r.status === 'validation_error');

  return {
    step,
    rows,
    parseError,
    processing,
    stats,
    canStartImport,
    handleClose,
    handleDownloadTemplate,
    handleFileSelect,
    updateRowData,
    handleStartImport,
    handleRetryRow,
    handleRetryAllErrors,
    setStep,
  };
}
