export type CompanyGroup = {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  companies?: CompanyGroupMember[];
};

export type CompanyGroupMember = {
  id: string;
  name: string;
  groupId?: string;
};

export type CreateCompanyGroupDto = {
  name: string;
  description?: string;
};
