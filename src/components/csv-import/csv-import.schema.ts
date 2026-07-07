import type { CsvImportConfig } from './csv-import.types';
import * as yup from 'yup';

export const csvBooleanSchema = () =>
  yup
    .boolean()
    .transform((_value, originalValue) => {
      if (typeof originalValue === 'boolean') return originalValue;
      if (typeof originalValue !== 'string') return false;

      const normalized = originalValue.trim().toLowerCase();
      if (['sim', 's', 'true', '1', 'yes'].includes(normalized)) return true;
      if (['nao', 'não', 'n', 'false', '0', 'no', ''].includes(normalized)) {
        return false;
      }
      return false;
    })
    .default(false);

export function createNameOnlyCsvImportConfig<T extends { name: string }>(options: {
  entityLabel: string;
  schema: yup.ObjectSchema<T>;
  onCreate: (row: T) => Promise<unknown>;
  exampleName?: string;
}): CsvImportConfig<T> {
  return {
    entityLabel: options.entityLabel,
    columns: [
      {
        key: 'name' as keyof T & string,
        header: 'Nome',
        required: true,
        example: options.exampleName ?? 'Exemplo',
      },
    ],
    schema: options.schema,
    onCreate: options.onCreate,
  };
}

export function createNameWithApprovalCsvImportConfig<
  T extends { name: string; needApprove: boolean },
>(options: {
  entityLabel: string;
  schema: yup.ObjectSchema<T>;
  onCreate: (row: T) => Promise<unknown>;
  exampleName?: string;
}): CsvImportConfig<T> {
  return {
    entityLabel: options.entityLabel,
    columns: [
      {
        key: 'name' as keyof T & string,
        header: 'Nome',
        required: true,
        example: options.exampleName ?? 'Exemplo',
      },
      {
        key: 'needApprove' as keyof T & string,
        header: 'Precisa Aprovação',
        example: 'Não',
      },
    ],
    schema: options.schema,
    onCreate: options.onCreate,
  };
}
