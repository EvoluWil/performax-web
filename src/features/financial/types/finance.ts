import { Client } from '@/features/client/types';
import { User } from '@/types/user';
import { FinanceBank } from './finance-bank';
import { FinanceCategory } from './finance-category';
import { FinancePayee } from './finance-payee';
import { FinancePaymentMethod } from './finance-payment-method';
import { FinanceType } from './finance-type';

export enum FinanceStatusEnum {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  PAID = 'PAID',
  REJECTED = 'REJECTED',
}

export enum FinanceFlowEnum {
  IN = 'IN',
  OUT = 'OUT',
  TRANSFER = 'TRANSFER',
}

export const financeStatusLabels: Record<
  FinanceStatusEnum,
  { label: string; color: string }
> = {
  [FinanceStatusEnum.PENDING]: { label: 'Pendente', color: 'orange' },
  [FinanceStatusEnum.APPROVED]: { label: 'Aprovado', color: 'green' },
  [FinanceStatusEnum.PAID]: { label: 'Pago', color: 'teal' },
  [FinanceStatusEnum.REJECTED]: { label: 'Rejeitado', color: 'red' },
};

export const financeFlowLabels: Record<
  FinanceFlowEnum,
  { label: string; color: string }
> = {
  [FinanceFlowEnum.IN]: { label: 'Entrada', color: 'success' },
  [FinanceFlowEnum.OUT]: { label: 'Saída', color: 'error' },
  [FinanceFlowEnum.TRANSFER]: { label: 'Transferência', color: 'info' },
};

export type Finance = {
  id: string;
  protocol: string;
  title: string;
  description?: string;
  value: number;
  tax: number;
  retention: number;
  date: Date;
  paymentDate?: Date;
  observation?: string;
  status: FinanceStatusEnum;
  approved: boolean;
  flow: FinanceFlowEnum;
  deleted: boolean;
  createdAt: Date;
  updatedAt: Date;

  createdById: string;
  typeId?: string;
  clientId?: string;
  methodId: string;
  bankId: string;
  companyId: string;
  companyInId?: string;
  categoryId?: string;
  segmentId?: string;
  payeeId?: string;
  responsibleId?: string;
  employeeId?: string;
  linkedFinanceId?: string;
  recurrenceMasterId?: string;

  // populated
  createdBy?: User;
  recurringMaster?: { id: string; recurrence?: string };
  type?: FinanceType;
  client?: Client;
  method?: FinancePaymentMethod;
  bank?: FinanceBank;
  category?: FinanceCategory;
  payee?: FinancePayee;
  responsible?: User;
  employee?: { id: string; name: string };
};

export type CreateFinanceDto = {
  title: string;
  description?: string;
  value?: number;
  tax?: number;
  retention?: number;
  date: string;
  paymentDate?: string;
  observation?: string;
  flow: FinanceFlowEnum;
  typeId?: string;
  clientId?: string;
  methodId: string;
  bankId: string;
  categoryId?: string;
  segmentId?: string;
  payeeId?: string;
  employeeId?: string;
  recurrence?: string;
};

export type CreateTransferDto = {
  title: string;
  description?: string;
  value: number;
  tax?: number;
  retention?: number;
  date: string;
  companyInId: string;
  bankId?: string;
  categoryId?: string;
  methodId?: string;
};
