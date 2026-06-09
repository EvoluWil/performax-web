export type ContractTypeAdjustment = {
  percentage: number;
  appliedAt: Date | string;
};

export type ContractType = {
  id: string;
  name: string;
  adjustments?: ContractTypeAdjustment[];
  lastAdjustmentPercentage?: number | null;
  lastAdjustmentAt?: Date | string | null;
  deleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  companyId: string;
};
