export type FinanceCategory = {
  id: string;
  name: string;
  segmentId?: string;
  deleted: boolean;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateFinanceCategoryDto = {
  name: string;
  segmentId?: string;
};
