export type FinancePaymentMethod = {
  id: string;
  name: string;
  deleted: boolean;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateFinancePaymentMethodDto = {
  name: string;
};
