import type { CsvImportConfig } from '@/components/csv-import';
import {
  FinanceBankFormDto,
  financeBankFormSchema,
} from '@/features/financial/schemas/finance-bank-drawer.schema';

export function createFinanceBankCsvImportConfig(
  onCreate: (row: FinanceBankFormDto) => Promise<unknown>,
): CsvImportConfig<FinanceBankFormDto> {
  return {
    entityLabel: 'bancos',
    columns: [
      {
        key: 'name',
        header: 'Nome',
        required: true,
        example: 'Banco Exemplo',
      },
      {
        key: 'code',
        header: 'Código',
        required: true,
        example: '001',
      },
    ],
    schema: financeBankFormSchema,
    onCreate,
  };
}
