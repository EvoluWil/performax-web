export type BudgetFilterDto = {
  pending: boolean;
  approved: boolean;
  charged: boolean;
  paid: boolean;
  financial: boolean;
  completed: boolean;
  rejected: boolean;

  clientId?: string;
  typeId?: string;
  userId?: string;

  startDate?: Date | null;
  endDate?: Date | null;

  protocol?: string;
  title?: string;
};

export const budgetFilterInitialValues: BudgetFilterDto = {
  pending: true,
  approved: true,
  charged: false,
  paid: false,
  financial: false,
  completed: false,
  rejected: false,
  clientId: undefined,
  typeId: undefined,
  userId: undefined,
  startDate: null,
  endDate: null,
  protocol: '',
  title: '',
};

export const BUDGET_STATUS_FILTER_MAP: Array<{
  status: string;
  field: keyof BudgetFilterDto;
}> = [
  { status: 'PENDING', field: 'pending' },
  { status: 'APPROVED', field: 'approved' },
  { status: 'CHARGED', field: 'charged' },
  { status: 'PAID', field: 'paid' },
  { status: 'FINANCIAL', field: 'financial' },
  { status: 'COMPLETED', field: 'completed' },
  { status: 'REJECTED', field: 'rejected' },
];
