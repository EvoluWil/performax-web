import { ModuleCode } from '@/constants/modules';

export type FilterFieldConfig = {
  field: string;
  module: ModuleCode;
};

export const TASK_FILTER_FIELDS: FilterFieldConfig[] = [
  { field: 'clientIds', module: 'client' },
  { field: 'userIds', module: 'user' },
  { field: 'typeIds', module: 'register' },
];

export const BUDGET_FILTER_FIELDS: FilterFieldConfig[] = [
  { field: 'clientIds', module: 'client' },
  { field: 'userIds', module: 'user' },
  { field: 'typeIds', module: 'register' },
];

export const OCCURRENCE_FILTER_FIELDS: FilterFieldConfig[] = [
  { field: 'clientIds', module: 'client' },
  { field: 'userIds', module: 'user' },
];

export const CONTRACT_FILTER_FIELDS: FilterFieldConfig[] = [
  { field: 'clientIds', module: 'client' },
  { field: 'typeIds', module: 'register' },
];

export const FINANCE_FILTER_FIELDS: FilterFieldConfig[] = [
  { field: 'typeIds', module: 'financial' },
  { field: 'bankIds', module: 'financial' },
  { field: 'categoryIds', module: 'financial' },
  { field: 'segmentIds', module: 'financial' },
  { field: 'payeeIds', module: 'financial' },
];
