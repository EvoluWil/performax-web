export interface TaskType {
  id: string;
  name: string;
  needApprove: boolean;
  deleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  companyId: string;
}
