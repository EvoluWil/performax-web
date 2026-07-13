export type TaskFilterDto = {
  pending: boolean;
  approved: boolean;
  open: boolean;
  expired: boolean;
  emergency: boolean;
  scheduled: boolean;
  impeded: boolean;
  in_progress: boolean;
  closed: boolean;
  rejected: boolean;
  title: string;
  protocol: string;
  typeId: string;
  startDate: string;
  endDate: string;
  clientId: string;
  userId: string;
  withValue: boolean;
};

export const taskFilterInitialValues: TaskFilterDto = {
  pending: true,
  approved: true,
  open: true,
  expired: false,
  emergency: false,
  scheduled: false,
  impeded: false,
  in_progress: true,
  closed: false,
  rejected: false,
  title: '',
  protocol: '',
  typeId: '',
  startDate: '',
  endDate: '',
  clientId: '',
  userId: '',
  withValue: false,
};

export const TASK_STATUS_FILTER_MAP: Array<{
  status: string;
  field: keyof TaskFilterDto;
}> = [
  { status: 'PENDING', field: 'pending' },
  { status: 'APPROVED', field: 'approved' },
  { status: 'OPEN', field: 'open' },
  { status: 'EXPIRED', field: 'expired' },
  { status: 'EMERGENCY', field: 'emergency' },
  { status: 'SCHEDULED', field: 'scheduled' },
  { status: 'IMPEDED', field: 'impeded' },
  { status: 'IN_PROGRESS', field: 'in_progress' },
  { status: 'CLOSED', field: 'closed' },
  { status: 'REJECTED', field: 'rejected' },
];
