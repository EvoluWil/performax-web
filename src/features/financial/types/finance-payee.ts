export type FinancePayee = {
  id: string;
  name: string;
  deleted: boolean;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateFinancePayeeDto = {
  name: string;
};
