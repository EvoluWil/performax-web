import { Client } from '@/features/client/types';
import { User } from '@/types/user';
import { BudgetType } from './budget-type';

export enum BudgetStatusEnum {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  COMPLETED = 'COMPLETED',
  CHARGED = 'CHARGED',
  PAID = 'PAID',
  FINANCIAL = 'FINANCIAL',
}

export const budgetStatusLabels = {
  [BudgetStatusEnum.PENDING]: { label: 'Pendente', color: 'orange' },
  [BudgetStatusEnum.APPROVED]: { label: 'Aprovado', color: 'green' },
  [BudgetStatusEnum.REJECTED]: { label: 'Rejeitado', color: 'red' },
  [BudgetStatusEnum.COMPLETED]: { label: 'Concluído', color: 'gray' },
  [BudgetStatusEnum.CHARGED]: { label: 'Faturado', color: 'purple' },
  [BudgetStatusEnum.PAID]: { label: 'Pago', color: 'teal' },
  [BudgetStatusEnum.FINANCIAL]: { label: 'Financeiro', color: 'blue' },
};

export const ORDERED_BUDGET_STATUSES = [
  BudgetStatusEnum.PENDING,
  BudgetStatusEnum.APPROVED,
  BudgetStatusEnum.FINANCIAL,
  BudgetStatusEnum.CHARGED,
  BudgetStatusEnum.PAID,
  BudgetStatusEnum.COMPLETED,
  BudgetStatusEnum.REJECTED,
] as const;

export const budgetStatusSelectOptions = ORDERED_BUDGET_STATUSES.map(
  (status) => ({
    value: status,
    label: budgetStatusLabels[status].label,
  }),
);

export enum ItemTypeEnum {
  PRODUCT = 'PRODUCT',
  SERVICE = 'SERVICE',
}

export type BudgetItem = {
  id?: string;
  label: string;
  value?: number;
  quantity?: number;
  type?: ItemTypeEnum;
};

export type Budget = {
  id: string;
  protocol: string;
  title: string;
  description: string;
  observation: string;
  value: number;
  createdAt: Date;
  updatedAt: Date;
  status: BudgetStatusEnum;
  approved: boolean;
  createdById: string;
  typeId: string;
  clientId: string;
  deleted: boolean;
  responsibleId: string;
  companyId: string;
  items: BudgetItem[];

  // references (populated)
  createdBy?: User;
  responsible?: User;
  client?: Client;
  type?: BudgetType;
};

export type CreateBudgetDto = {
  title: string;
  description?: string;
  observation?: string;
  value?: number;
  typeId: string;
  clientId?: string;
  responsibleId?: string;
  items?: BudgetItem[];
};
