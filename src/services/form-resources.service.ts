import { api } from '@/config/api';
import { companyService } from '@/services/company.service';

export const RESOURCE_KEYS = [
  'users',
  'clients',
  'financeTypes',
  'financeBanks',
  'financeCategories',
  'financeSegments',
  'financePayees',
  'financePaymentMethods',
  'taskTypes',
  'employees',
  'budgetTypes',
  'occurrenceTypes',
  'contractTypes',
] as const;

export type ResourceKey = (typeof RESOURCE_KEYS)[number];

export type ResourceItem = {
  id: string;
  name: string;
  [key: string]: unknown;
};

export type FormResourcesResult = Partial<Record<ResourceKey, ResourceItem[]>>;

export type FormResourcesRequest = {
  resources: ResourceKey[];
  search?: Partial<Record<ResourceKey, string>>;
};

export async function fetchFormResources(
  payload: FormResourcesRequest,
  companyId?: string,
): Promise<FormResourcesResult> {
  const id = companyId || companyService.getDefaultCompany()?.id;
  if (!id) return {};
  const { data } = await api.post<FormResourcesResult>(
    `/companies/${id}/form-resources`,
    payload,
  );
  return data;
}
