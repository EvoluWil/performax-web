export type Employee = {
  id: string;
  name: string;
  cpf: string;
  deleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  companyId: string;
  clientId?: string;
};
