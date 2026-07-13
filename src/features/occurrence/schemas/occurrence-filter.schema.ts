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
  clientId: string;
  userId: string;
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
  clientId: '',
  userId: '',
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
