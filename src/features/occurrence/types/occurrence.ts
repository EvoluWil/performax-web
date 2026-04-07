import { Client } from '@/features/client/types';
import { File } from '@/types/file';
import { User } from '@/types/user';
import { OccurrenceType } from './occurrence-type';

export enum OccurrenceStatusEnum {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
}

export const occurrenceStatusLabels = {
  [OccurrenceStatusEnum.PENDING]: { label: 'Pendente', color: 'orange' },
  [OccurrenceStatusEnum.APPROVED]: { label: 'Aprovada', color: 'green' },
  [OccurrenceStatusEnum.REJECTED]: { label: 'Rejeitada', color: 'red' },
  [OccurrenceStatusEnum.IN_PROGRESS]: {
    label: 'Em progresso',
    color: 'blue',
  },
  [OccurrenceStatusEnum.COMPLETED]: { label: 'Concluída', color: 'gray' },
};

export type Occurrence = {
  id: string;
  protocol: string;
  title: string;
  description?: string;
  observation?: string;
  date: Date;
  documents: File[];
  createdAt: Date;
  updatedAt: Date;
  status: OccurrenceStatusEnum;
  approved: boolean;
  createdById: string;
  createdBy?: User;
  clientId?: string;
  client?: Client;
  typeId?: string;
  type?: OccurrenceType;
  responsibleId?: string;
  responsible?: User;
  deleted: boolean;
  companyId: string;
};

export type CreateOccurrenceDto = {
  title: string;
  description?: string;
  observation?: string;
  date: Date | string;
  clientId?: string;
  typeId: string;
  responsibleId?: string;
  documents?: File[];
};
