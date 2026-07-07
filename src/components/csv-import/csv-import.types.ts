import type { ResourceKey } from '@/services/form-resources.service';
import * as yup from 'yup';

export type CsvColumnConfig<T extends Record<string, unknown>> = {
  key: keyof T & string;
  header: string;
  required?: boolean;
  example?: string;
};

export type CsvReferenceConfig = {
  csvKey: string;
  targetKey: string;
  resourceKey: ResourceKey;
  label: string;
  required?: boolean;
};

export type CsvImportConfig<
  TImport extends Record<string, unknown>,
  TPayload = TImport,
> = {
  entityLabel: string;
  columns: CsvColumnConfig<TImport>[];
  schema: yup.ObjectSchema<TImport>;
  references?: CsvReferenceConfig[];
  mapRow?: (
    row: TImport,
    resolvedIds: Record<string, string | undefined>,
  ) => TPayload;
  onCreate: (row: TPayload) => Promise<unknown>;
};

export type ImportRowStatus =
  | 'pending'
  | 'processing'
  | 'success'
  | 'error'
  | 'validation_error';

export type ImportRow<T extends Record<string, unknown>> = {
  id: string;
  lineNumber: number;
  data: T;
  status: ImportRowStatus;
  error?: string;
  resolvedIds?: Record<string, string | undefined>;
  unresolvedRefs?: string[];
};

export type CsvImportStep = 'upload' | 'preview' | 'processing' | 'results';

export type CsvImportModalProps<
  TImport extends Record<string, unknown>,
  TPayload = TImport,
> = {
  open: boolean;
  onClose: () => void;
  config: CsvImportConfig<TImport, TPayload>;
  onComplete?: () => void;
};
