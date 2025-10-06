export type TaskFilterDto = {
  open: boolean;
  expired: boolean;
  emergency: boolean;
  scheduled: boolean;
  impeded: boolean;
  in_progress: boolean;
  rejected: boolean;
  closed: boolean;
  title: string;
  protocol: string;
  typeId: string;
  startDate: string;
  endDate: string;
  clientId: string;
  userId: string;
};

export const taskFilterInitialValues: TaskFilterDto = {
  open: true,
  expired: false,
  emergency: false,
  scheduled: false,
  impeded: false,
  in_progress: true,
  closed: false,
  rejected: false,
  title: "",
  protocol: "",
  typeId: "",
  startDate: "",
  endDate: "",
  clientId: "",
  userId: "",
};
