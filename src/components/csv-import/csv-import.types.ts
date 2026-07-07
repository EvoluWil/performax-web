import * as yup from 'yup';

export type CsvColumnConfig<T extends Record<string, unknown>> = {
  key: keyof T & string;
  header: string;
  required?: boolean;
  example?: string;
};

export type CsvImportConfig<T extends Record<string, unknown>> = {
  entityLabel: string;
  columns: CsvColumnConfig<T>[];
  schema: yup.ObjectSchema<T>;
  onCreate: (row: T) => Promise<unknown>;
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
};

export type CsvImportStep = 'upload' | 'preview' | 'processing' | 'results';

export type CsvImportModalProps<T extends Record<string, unknown>> = {
  open: boolean;
  onClose: () => void;
  config: CsvImportConfig<T>;
  onComplete?: () => void;
};
