export type FinanceCategory = {
  id: string;
  name: string;
  deleted: boolean;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateFinanceCategoryDto = {
  name: string;
};
