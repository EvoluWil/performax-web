import { Client } from '@/features/client/types';
import { File } from '@/types/file';
import { User } from '@/types/user';
import { ChecklistDto } from '.';
import { TaskType } from './task-type';

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

export const taskStatusLabels = {
  [TaskStatusEnum.PENDING]: { label: 'Pendente', color: 'orange' },
  [TaskStatusEnum.APPROVED]: { label: 'Aprovada', color: 'green' },
  [TaskStatusEnum.REJECTED]: { label: 'Rejeitada', color: 'red' },
  [TaskStatusEnum.OPEN]: { label: 'Em Aberto', color: 'blue' },
  [TaskStatusEnum.CLOSED]: { label: 'Fechada', color: 'gray' },
  [TaskStatusEnum.EXPIRED]: { label: 'Expirada', color: 'error' },
  [TaskStatusEnum.EMERGENCY]: { label: 'Emergencial', color: 'red' },
  [TaskStatusEnum.SCHEDULED]: { label: 'Agendada', color: 'purple' },
  [TaskStatusEnum.IMPEDED]: { label: 'Impedida', color: 'yellow' },
  [TaskStatusEnum.IN_PROGRESS]: { label: 'Em Progresso', color: 'cyan' },
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
  client: Client;
  companyId: string;
  typeId: string;
  type: TaskType;
  updatedById: string;
  createdById: string;
  budgetId: string;
  deleted: boolean;
  closeBudgetId: string;
  responsibleId: string;
  responsible: User;
  checklist: ChecklistDto;
  files: File[];
  conclusionFiles: File[];
};
