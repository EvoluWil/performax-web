export type FinanceType = {
  id: string;
  name: string;
  needApprove: boolean;
  deleted: boolean;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateFinanceTypeDto = {
  name: string;
  needApprove?: boolean;
};
