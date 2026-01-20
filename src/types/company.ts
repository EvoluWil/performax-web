import { Module } from './module';
import { User } from './user';

export type CompanyUserRole = {
  id: string;
  userId: string;
  user: User;
  companyId: string;
  company: Company;
  role: object;
  createdAt: Date;
  updatedAt: Date;
};

export type CompanyModule = {
  id: string;
  moduleId: string;
  module: Module;
  companyId: string;
  company: Company;
};

export type CompanyWhiteLabel = {
  id: string;
  name: string;
  logo: string;
  banner: string;
  primaryColor: string;
  secondaryColor: string;
  createdAt: Date;
  updatedAt: Date;
  companyId: string;
  company: Company;
};

export type Company = {
  id: string;
  name: string;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
  whiteLabel?: CompanyWhiteLabel;
};
