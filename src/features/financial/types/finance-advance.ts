import { Finance } from './finance';

export enum AdvanceStatusEnum {
  OPEN = 'OPEN',
  PARTIAL = 'PARTIAL',
  SETTLED = 'SETTLED',
}

export const advanceStatusLabels: Record<
  AdvanceStatusEnum,
  { label: string; color: string }
> = {
  [AdvanceStatusEnum.OPEN]: { label: 'Em aberto', color: 'orange' },
  [AdvanceStatusEnum.PARTIAL]: { label: 'Parcial', color: 'blue' },
  [AdvanceStatusEnum.SETTLED]: { label: 'Saldado', color: 'green' },
};

export type FinanceAdvance = {
  id: string;
  protocol: string;
  title: string;
  description?: string;
  observation?: string;
  totalValue: number;
  remainingValue: number;
  date: Date;
  status: AdvanceStatusEnum;
  companyId: string;
  createdById: string;
  bankId?: string;
  methodId?: string;
  typeId?: string;
  createdAt: Date;
  updatedAt: Date;
  applications?: Pick<
    Finance,
    | 'id'
    | 'protocol'
    | 'title'
    | 'value'
    | 'tax'
    | 'retention'
    | 'flow'
    | 'status'
    | 'paymentDate'
    | 'date'
  >[];
};

export type FinanceAdvanceAvailable = Pick<
  FinanceAdvance,
  'id' | 'protocol' | 'title' | 'totalValue' | 'remainingValue' | 'status' | 'date'
>;

export type CreateAdvanceDto = {
  title: string;
  description?: string;
  observation?: string;
  totalValue: number;
  date: string;
  bankId: string;
  methodId: string;
  typeId?: string;
};
