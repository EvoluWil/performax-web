import { Company, CompanyUserRole } from './company';

export const UserRoleEnum = {
  SYSTEM_ADMIN: 'SYSTEM_ADMIN',
  USER: 'USER',
} as const;

export type UserRoleEnum = (typeof UserRoleEnum)[keyof typeof UserRoleEnum];

export type User = {
  id: string;
  name: string;
  cpf: string;
  email: string;
  role: UserRoleEnum;
  companies: Company[];
  companyUser: CompanyUserRole[];
  createdAt: Date;
  updatedAt: Date;
  supervisedByIds: string[];
};
