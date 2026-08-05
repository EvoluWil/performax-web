import { ModuleCode } from '@/constants/modules';

export type FilterFieldConfig = {
  field: string;
  module: ModuleCode;
};

export const TASK_FILTER_FIELDS: FilterFieldConfig[] = [
  { field: 'clientId', module: 'client' },
  { field: 'userId', module: 'user' },
  { field: 'typeId', module: 'register' },
];

export const BUDGET_FILTER_FIELDS: FilterFieldConfig[] = [
  { field: 'clientId', module: 'client' },
  { field: 'userId', module: 'user' },
  { field: 'typeId', module: 'register' },
];

export const OCCURRENCE_FILTER_FIELDS: FilterFieldConfig[] = [
  { field: 'clientId', module: 'client' },
  { field: 'userId', module: 'user' },
];

export const CONTRACT_FILTER_FIELDS: FilterFieldConfig[] = [
  { field: 'clientId', module: 'client' },
  { field: 'typeId', module: 'register' },
];

export const FINANCE_FILTER_FIELDS: FilterFieldConfig[] = [
  { field: 'typeId', module: 'financial' },
  { field: 'bankId', module: 'financial' },
  { field: 'categoryId', module: 'financial' },
  { field: 'segmentId', module: 'financial' },
  { field: 'payeeId', module: 'financial' },
];
