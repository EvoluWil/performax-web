export type FinanceSegment = {
  id: string;
  name: string;
  deleted: boolean;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateFinanceSegmentDto = {
  name: string;
};
