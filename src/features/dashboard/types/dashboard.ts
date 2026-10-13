export type DashboardMoney = 'cents' | 'unit';

export type DashboardPriorityItem = {
  id: string;
  protocol: string;
  title: string;
  value: number;
  date: string | null;
  clientName: string | null;
};

export type DashboardPriority = {
  id:
    | 'expired-tasks'
    | 'overdue-receivables'
    | 'impeded-tasks'
    | 'budgets-awaiting';
  severity: 'high' | 'medium';
  label: string;
  count: number;
  value: number;
  money: DashboardMoney;
  href: string;
  items: DashboardPriorityItem[];
};

export type DashboardCountValue = {
  count: number;
  value: number;
};

export type DashboardFlowSlice = {
  in: number;
  out: number;
  result: number;
  inPaid: number;
  inOpen: number;
  outPaid: number;
  outOpen: number;
};

export type DashboardBucket = {
  key: string;
  label: string;
  count: number;
  value: number;
};

export type DashboardWindow = {
  month: string;
  from: string;
  to: string;
  previousFrom: string;
  previousTo: string;
  complete: boolean;
  forecastTo: string;
  label: string;
};

export type DashboardResponse = {
  window: DashboardWindow;
  overview: {
    cards: {
      openTasks: { count: number; expired: number } | null;
      punctuality: {
        onTime: number;
        total: number;
        previousOnTime: number;
        previousTotal: number;
      } | null;
      overdueReceivables: DashboardCountValue | null;
      negotiation: DashboardCountValue | null;
      result: { current: number; previous: number } | null;
      impeded: { count: number } | null;
    };
    priorities: DashboardPriority[];
  };
  operations: {
    tasks: {
      queue: { status: string; count: number }[];
      open: number;
      attention: {
        awaitingApproval: number;
        expired: number;
        emergency: number;
        impeded: number;
      };
      throughput: {
        current: { created: number; closed: number };
        previous: { created: number; closed: number };
      };
      punctuality: {
        onTime: number;
        total: number;
        previousOnTime: number;
        previousTotal: number;
      };
      overdueByDueMonth: { month: string; count: number }[];
    } | null;
    occurrences: {
      open: number;
      awaitingApproval: number;
      byStatus: { status: string; count: number }[];
      completed: { current: number; previous: number };
    } | null;
  } | null;
  financial: {
    comparison: {
      current: DashboardFlowSlice;
      previous: DashboardFlowSlice;
    };
    forecast: DashboardFlowSlice | null;
    overdueReceivables: DashboardCountValue & { buckets: DashboardBucket[] };
    overduePayables: DashboardCountValue & { buckets: DashboardBucket[] };
    wallet: number;
    advances: DashboardCountValue;
  } | null;
  commercial: {
    stages: { status: string; count: number; value: number }[];
    rejected: number;
    created: {
      current: DashboardCountValue;
      previous: DashboardCountValue;
    };
    negotiation: DashboardCountValue;
    approval: { approved: number; rejected: number };
  } | null;
};
