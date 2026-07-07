import {
  createNameOnlyCsvImportConfig,
  createNameWithApprovalCsvImportConfig,
  csvBooleanSchema,
} from '@/components/csv-import/csv-import.schema';
import type { CsvImportConfig } from '@/components/csv-import';
import {
  TaskTypeFormDto,
  taskTypeFormSchema,
} from '@/features/task/schemas/task-type-drawer.schema';
import {
  BudgetTypeFormDto,
  budgetTypeFormSchema,
} from '@/features/budget/schemas/budget-type.schema';
import {
  OccurrenceTypeFormDto,
  occurrenceTypeFormSchema,
} from '@/features/occurrence/schemas/occurrence-type-drawer.schema';
import {
  ContractTypeFormDto,
  contractTypeFormSchema,
} from '@/features/contract/schemas/contract-type.schema';
import * as yup from 'yup';

const taskTypeImportSchema = taskTypeFormSchema.shape({
  needApprove: csvBooleanSchema(),
}) as yup.ObjectSchema<TaskTypeFormDto>;

const budgetTypeImportSchema = budgetTypeFormSchema.shape({
  needApprove: csvBooleanSchema(),
}) as yup.ObjectSchema<BudgetTypeFormDto>;

const occurrenceTypeImportSchema = occurrenceTypeFormSchema.shape({
  needApprove: csvBooleanSchema(),
}) as yup.ObjectSchema<OccurrenceTypeFormDto>;

export const createTaskTypeCsvImportConfig = (
  onCreate: (row: TaskTypeFormDto) => Promise<unknown>,
): CsvImportConfig<TaskTypeFormDto> =>
  createNameWithApprovalCsvImportConfig({
    entityLabel: 'tipos de OS',
    schema: taskTypeImportSchema,
    onCreate,
    exampleName: 'Manutenção preventiva',
  });

export const createBudgetTypeCsvImportConfig = (
  onCreate: (row: BudgetTypeFormDto) => Promise<unknown>,
): CsvImportConfig<BudgetTypeFormDto> =>
  createNameWithApprovalCsvImportConfig({
    entityLabel: 'tipos de orçamento',
    schema: budgetTypeImportSchema,
    onCreate,
    exampleName: 'Orçamento padrão',
  });

export const createOccurrenceTypeCsvImportConfig = (
  onCreate: (row: OccurrenceTypeFormDto) => Promise<unknown>,
): CsvImportConfig<OccurrenceTypeFormDto> =>
  createNameWithApprovalCsvImportConfig({
    entityLabel: 'tipos de ocorrência',
    schema: occurrenceTypeImportSchema,
    onCreate,
    exampleName: 'Incidente',
  });

export const createContractTypeCsvImportConfig = (
  onCreate: (row: ContractTypeFormDto) => Promise<unknown>,
): CsvImportConfig<ContractTypeFormDto> =>
  createNameOnlyCsvImportConfig({
    entityLabel: 'tipos de contrato',
    schema: contractTypeFormSchema,
    onCreate,
    exampleName: 'Contrato mensal',
  });
