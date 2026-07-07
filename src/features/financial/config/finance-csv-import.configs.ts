import {
  createNameOnlyCsvImportConfig,
  createNameWithApprovalCsvImportConfig,
  csvBooleanSchema,
} from '@/components/csv-import/csv-import.schema';
import type { CsvImportConfig } from '@/components/csv-import';
import {
  FinanceCategoryFormDto,
  financeCategoryFormSchema,
} from '../schemas/finance-category-drawer.schema';
import {
  FinancePayeeFormDto,
  financePayeeFormSchema,
} from '../schemas/finance-payee-drawer.schema';
import {
  FinancePaymentMethodFormDto,
  financePaymentMethodFormSchema,
} from '../schemas/finance-payment-method-drawer.schema';
import {
  FinanceSegmentFormDto,
  financeSegmentFormSchema,
} from '../schemas/finance-segment-drawer.schema';
import {
  FinanceTypeFormDto,
  financeTypeFormSchema,
} from '../schemas/finance-type-drawer.schema';
import * as yup from 'yup';

const financeTypeImportSchema = financeTypeFormSchema.shape({
  needApprove: csvBooleanSchema(),
}) as yup.ObjectSchema<FinanceTypeFormDto>;

export const createFinanceCategoryCsvImportConfig = (
  onCreate: (row: FinanceCategoryFormDto) => Promise<unknown>,
): CsvImportConfig<FinanceCategoryFormDto> =>
  createNameOnlyCsvImportConfig({
    entityLabel: 'categorias financeiras',
    schema: financeCategoryFormSchema,
    onCreate,
    exampleName: 'Receitas operacionais',
  });

export const createFinanceSegmentCsvImportConfig = (
  onCreate: (row: FinanceSegmentFormDto) => Promise<unknown>,
): CsvImportConfig<FinanceSegmentFormDto> =>
  createNameOnlyCsvImportConfig({
    entityLabel: 'segmentos financeiros',
    schema: financeSegmentFormSchema,
    onCreate,
    exampleName: 'Administrativo',
  });

export const createFinancePayeeCsvImportConfig = (
  onCreate: (row: FinancePayeeFormDto) => Promise<unknown>,
): CsvImportConfig<FinancePayeeFormDto> =>
  createNameOnlyCsvImportConfig({
    entityLabel: 'favorecidos',
    schema: financePayeeFormSchema,
    onCreate,
    exampleName: 'Fornecedor Exemplo',
  });

export const createFinanceTypeCsvImportConfig = (
  onCreate: (row: FinanceTypeFormDto) => Promise<unknown>,
): CsvImportConfig<FinanceTypeFormDto> =>
  createNameWithApprovalCsvImportConfig({
    entityLabel: 'centros de custo',
    schema: financeTypeImportSchema,
    onCreate,
    exampleName: 'Operacional',
  });

export const createFinancePaymentMethodCsvImportConfig = (
  onCreate: (row: FinancePaymentMethodFormDto) => Promise<unknown>,
): CsvImportConfig<FinancePaymentMethodFormDto> =>
  createNameOnlyCsvImportConfig({
    entityLabel: 'métodos de pagamento',
    schema: financePaymentMethodFormSchema,
    onCreate,
    exampleName: 'PIX',
  });
