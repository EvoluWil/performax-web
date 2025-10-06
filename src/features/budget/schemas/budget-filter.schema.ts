export type BudgetFilterDto = {
  // status toggles
  pending: boolean; // PENDING, APPROVED
  financial: boolean; // CHARGED, PAID, FINANCIAL
  closed: boolean; // COMPLETED, REJECTED

  // relations
  clientId?: string;
  typeId?: string;
  userId?: string; // responsibleId

  // ranges
  startDate?: Date | null;
  endDate?: Date | null;

  // text filters
  protocol?: string;
  title?: string;
};

export const budgetFilterInitialValues: BudgetFilterDto = {
  pending: true,
  financial: false,
  closed: false,
  clientId: undefined,
  typeId: undefined,
  userId: undefined,
  startDate: null,
  endDate: null,
  protocol: "",
  title: "",
};
