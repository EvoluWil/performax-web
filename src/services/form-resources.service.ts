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
): Promise<FormResourcesResult> {
  const companyId = companyService.getDefaultCompany()?.id;
  if (!companyId) return {};
  const { data } = await api.post<FormResourcesResult>(
    `/companies/${companyId}/form-resources`,
    payload,
  );
  return data;
}
