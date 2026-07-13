import { FinanceFlowEnum } from './finance';

export type FinanceRecurring = {
  id: string;
  title: string;
  description?: string;
  value: number;
  date: Date;
  observation?: string;
  flow: FinanceFlowEnum;
  endDate?: Date;
  recurrence?: string;
  lastDate: Date;
  companyId: string;
  typeId: string;
  clientId: string;
  methodId: string;
  bankId: string;
  categoryId: string;
  segmentId?: string;
  payeeId?: string;
  employeeId?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateFinanceRecurringDto = {
  title: string;
  description?: string;
  value?: number;
  date: string;
  flow: FinanceFlowEnum;
  recurrence?: string;
  endDate?: string;
  typeId?: string;
  bankId?: string;
  methodId?: string;
  categoryId?: string;
  segmentId?: string;
  payeeId?: string;
  clientId?: string;
};
