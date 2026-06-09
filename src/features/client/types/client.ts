import { User } from '@/types/user';

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
  cnpj: string;
  address: string;
  deleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  companyId: string;
  userIds: string[];
  createdBy?: Pick<User, 'id' | 'name'> | null;
  compliance?: ClientCompliance;
  contracts?: import('@/features/contract/types').Contract[];
};
