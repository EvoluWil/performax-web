export type OccurrenceFilterDto = {
  open: boolean;
  closed: boolean;
  title: string;
  protocol: string;
  startDate: string;
  endDate: string;
  clientId: string;
  userId: string;
};

export const occurrenceFilterInitialValues: OccurrenceFilterDto = {
  open: true,
  closed: false,
  title: '',
  protocol: '',
  startDate: '',
  endDate: '',
  clientId: '',
  userId: '',
};
