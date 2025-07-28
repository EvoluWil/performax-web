import { Permission } from './permission';

export type Role = {
  id: string;
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  isAdmin: boolean;
  companyId: string;
  permissions: Permission[];
};
