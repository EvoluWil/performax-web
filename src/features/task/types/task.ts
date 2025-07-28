import { File } from '@/types/file';

export const TaskStatusEnum = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  OPEN: 'OPEN',
  CLOSED: 'CLOSED',
  EXPIRED: 'EXPIRED',
  EMERGENCY: 'EMERGENCY',
  SCHEDULED: 'SCHEDULED',
  IMPEDED: 'IMPEDED',
  IN_PROGRESS: 'IN_PROGRESS',
};

export type TaskStatusEnum =
  (typeof TaskStatusEnum)[keyof typeof TaskStatusEnum];

export type Task = {
  id: string;
  protocol: string;
  title: string;
  description: string;
  service: string;
  internalNote: string;
  impedimentNote: string;
  status: TaskStatusEnum;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
  completedAt: Date;
  clientId: string;
  companyId: string;
  typeId: string;
  updatedById: string;
  createdById: string;
  budgetId: string;
  deleted: boolean;
  closeBudgetId: string;
  responsibleId: string;
  files: File[];
  conclusionFiles: File[];
};
