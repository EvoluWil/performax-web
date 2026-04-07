export type FinanceBank = {
  id: string;
  name: string;
  code: string;
  deleted: boolean;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateFinanceBankDto = {
  name: string;
  code: string;
};
