import { Finance, FinanceFlowEnum } from './finance';

export enum ReceivableStatusEnum {
  OPEN = 'OPEN',
  PARTIAL = 'PARTIAL',
  SETTLED = 'SETTLED',
}

export const receivableStatusLabels: Record<
  ReceivableStatusEnum,
  { label: string; color: string }
> = {
  [ReceivableStatusEnum.OPEN]: { label: 'Em aberto', color: 'orange' },
  [ReceivableStatusEnum.PARTIAL]: { label: 'Parcial', color: 'blue' },
  [ReceivableStatusEnum.SETTLED]: { label: 'Quitada', color: 'green' },
};

export type FinanceReceivable = {
  id: string;
  protocol: string;
  title: string;
  description?: string;
  observation?: string;
  totalValue: number;
  installmentCount: number;
  paidCount: number;
  flow: FinanceFlowEnum;
  status: ReceivableStatusEnum;
  companyId: string;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
  installments?: Pick<
    Finance,
    | 'id'
    | 'receivableInstallment'
    | 'status'
    | 'value'
    | 'date'
    | 'paymentDate'
  >[];
};

export type CreateReceivableDto = {
  title: string;
  description?: string;
  observation?: string;
  totalValue: number;
  installmentCount: number;
  firstDueDate: string;
  flow: FinanceFlowEnum;
  bankId: string;
  methodId: string;
  typeId?: string;
  categoryId?: string;
  segmentId?: string;
  payeeId?: string;
  clientId?: string;
  employeeId?: string;
  responsibleId?: string;
};
