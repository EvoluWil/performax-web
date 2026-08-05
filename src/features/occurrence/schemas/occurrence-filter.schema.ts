import { buildStatusOrFilterFromMap } from '@/utils/query';
import { Filter } from 'nestjs-prisma-querybuilder-interface';

export type OccurrenceFilterDto = {
  pending: boolean;
  approved: boolean;
  in_progress: boolean;
  rejected: boolean;
  completed: boolean;
  title: string;
  protocol: string;
  startDate: string;
  endDate: string;
  clientIds: string[];
  userIds: string[];
};

export const occurrenceFilterInitialValues: OccurrenceFilterDto = {
  pending: true,
  approved: true,
  in_progress: true,
  rejected: false,
  completed: false,
  title: '',
  protocol: '',
  startDate: '',
  endDate: '',
  clientIds: [],
  userIds: [],
};

export const OCCURRENCE_STATUS_FILTER_MAP: Array<{
  status: string;
  field: keyof OccurrenceFilterDto;
}> = [
  { status: 'PENDING', field: 'pending' },
  { status: 'APPROVED', field: 'approved' },
  { status: 'IN_PROGRESS', field: 'in_progress' },
  { status: 'REJECTED', field: 'rejected' },
  { status: 'COMPLETED', field: 'completed' },
];

export const buildOccurrenceStatusOrFilter = (data: OccurrenceFilterDto): Filter =>
  buildStatusOrFilterFromMap(data, OCCURRENCE_STATUS_FILTER_MAP);
