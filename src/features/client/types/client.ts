export type Client = {
  id: string;
  name: string;
  cnpj: string;
  address: string;
  deleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  companyId: string;
  userIds: string[];
};
