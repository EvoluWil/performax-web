import { User } from '@/types/user';

export type FiscalAddress = {
  street?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  cityCode?: string;
};

export type PersonType = 'PF' | 'PJ';

export type FiscalStatus = {
  ready: boolean;
  missingFields: string[];
};

export type ClientComplianceStatus =
  | 'COMPLIANT'
  | 'NON_COMPLIANT'
  | 'NO_CONTRACTS';

export type ClientCompliance = {
  status: ClientComplianceStatus;
  overdueCount: number;
};

export type Client = {
  id: string;
  name: string;
  cnpj?: string | null;
  address?: string | null;
  personType?: PersonType | null;
  cpf?: string | null;
  email?: string | null;
  phone?: string | null;
  fiscalAddress?: FiscalAddress | null;
  deleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  companyId: string;
  userIds: string[];
  createdBy?: Pick<User, 'id' | 'name'> | null;
  compliance?: ClientCompliance;
  fiscalStatus?: FiscalStatus;
  contracts?: import('@/features/contract/types').Contract[];
};
