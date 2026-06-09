import { File } from '@/types/file';
import { Client } from '@/features/client/types';
import { ContractType } from './contract-type';
import { User } from '@/types/user';

export type Contract = {
  id: string;
  value: number;
  startDate?: string | Date | null;
  endDate?: string | Date | null;
  dueDate?: string | Date | null;
  scope?: string | null;
  attachment?: File | null;
  generatedPdf?: File | null;
  active: boolean;
  recurringId?: string | null;
  deleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  clientId: string;
  typeId: string;
  createdById: string;
  companyId: string;
  client?: Pick<Client, 'id' | 'name' | 'cnpj' | 'address'>;
  type?: ContractType;
  createdBy?: Pick<User, 'id' | 'name'>;
};

export type CreateContractDto = {
  clientId: string;
  typeId: string;
  value?: number;
  startDate?: string;
  endDate?: string;
  dueDate?: string;
  scope?: string;
  generatedPdf?: File | null;
};

export type GenerateContractRecurringDto = {
  typeId: string;
  bankId: string;
  methodId: string;
  categoryId: string;
  segmentId?: string;
  recurrence?: string;
  flow?: 'IN' | 'OUT';
};

export type SignedAttachmentDto = {
  attachment: File;
};
