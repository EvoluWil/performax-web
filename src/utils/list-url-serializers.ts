import {
  BUDGET_STATUS_FILTER_MAP,
  BudgetFilterDto,
  budgetFilterInitialValues,
} from '@/features/budget/schemas/budget-filter.schema';
import { ContractFilterDto } from '@/features/contract/schemas/contract.schema';
import {
  FinanceFilterDto,
  makeFinanceFilterInitialValues,
} from '@/features/financial/schemas/finance-filter.schema';
import {
  OCCURRENCE_STATUS_FILTER_MAP,
  OccurrenceFilterDto,
  occurrenceFilterInitialValues,
} from '@/features/occurrence/schemas/occurrence-filter.schema';
import {
  TASK_STATUS_FILTER_MAP,
  TaskFilterDto,
  taskFilterInitialValues,
} from '@/features/task/schemas/task-filter.schema';
import { DEFAULT_ATTENDANCE_STATUSES } from '@/features/attendance/hooks/queries/attendance-tasks.query';
import {
  mergeUrlParams,
  parseCommaList,
  parseDateOnlyParam,
  parseIsoDateParam,
  parseSearchParam,
  parseStatusFilter,
  parseStringParam,
  serializeCommaList,
  serializeDateOnlyParam,
  serializeIsoDateParam,
  serializeSearchParam,
  serializeStatusFilter,
  serializeStringParam,
  arraysEqual,
  LIST_URL_KEYS,
} from './list-url-state';

function parseArrayField(params: URLSearchParams, key: string): string[] {
  return parseCommaList(params.get(key));
}

function serializeArrayField(
  value: string[] | undefined,
): string | undefined {
  return serializeCommaList(value);
}

export function parseTaskFilterFromUrl(params: URLSearchParams): TaskFilterDto {
  const statusFields = parseStatusFilter(
    params,
    LIST_URL_KEYS.status,
    TASK_STATUS_FILTER_MAP,
    taskFilterInitialValues,
  );

  return {
    ...taskFilterInitialValues,
    ...statusFields,
    title: parseStringParam(params.get('title')),
    protocol: parseStringParam(params.get('protocol')),
    typeIds: parseArrayField(params, 'typeIds'),
    clientIds: parseArrayField(params, 'clientIds'),
    userIds: parseArrayField(params, 'userIds'),
    startDate: parseDateOnlyParam(params.get('startDate')),
    endDate: parseDateOnlyParam(params.get('endDate')),
    withValue: params.get('withValue') === '1',
  };
}

export function serializeTaskFilterToUrl(
  filter: TaskFilterDto,
): Record<string, string | undefined> {
  return {
    [LIST_URL_KEYS.status]: serializeStatusFilter(
      filter,
      TASK_STATUS_FILTER_MAP,
      taskFilterInitialValues,
    ),
    title: serializeStringParam(filter.title),
    protocol: serializeStringParam(filter.protocol),
    typeIds: serializeArrayField(filter.typeIds),
    clientIds: serializeArrayField(filter.clientIds),
    userIds: serializeArrayField(filter.userIds),
    startDate: serializeStringParam(filter.startDate),
    endDate: serializeStringParam(filter.endDate),
    withValue: filter.withValue ? '1' : undefined,
  };
}

export function parseBudgetFilterFromUrl(
  params: URLSearchParams,
): BudgetFilterDto {
  const statusFields = parseStatusFilter(
    params,
    LIST_URL_KEYS.status,
    BUDGET_STATUS_FILTER_MAP,
    budgetFilterInitialValues,
  );

  const startDateRaw = params.get('startDate');
  const endDateRaw = params.get('endDate');

  return {
    ...budgetFilterInitialValues,
    ...statusFields,
    title: parseStringParam(params.get('title')),
    protocol: parseStringParam(params.get('protocol')),
    typeIds: parseArrayField(params, 'typeIds'),
    clientIds: parseArrayField(params, 'clientIds'),
    userIds: parseArrayField(params, 'userIds'),
    startDate: startDateRaw ? new Date(startDateRaw) : null,
    endDate: endDateRaw ? new Date(endDateRaw) : null,
  };
}

export function serializeBudgetFilterToUrl(
  filter: BudgetFilterDto,
): Record<string, string | undefined> {
  return {
    [LIST_URL_KEYS.status]: serializeStatusFilter(
      filter,
      BUDGET_STATUS_FILTER_MAP,
      budgetFilterInitialValues,
    ),
    title: serializeStringParam(filter.title),
    protocol: serializeStringParam(filter.protocol),
    typeIds: serializeArrayField(filter.typeIds),
    clientIds: serializeArrayField(filter.clientIds),
    userIds: serializeArrayField(filter.userIds),
    startDate: serializeDateOnlyParam(filter.startDate),
    endDate: serializeDateOnlyParam(filter.endDate),
  };
}

export function parseOccurrenceFilterFromUrl(
  params: URLSearchParams,
): OccurrenceFilterDto {
  const statusFields = parseStatusFilter(
    params,
    LIST_URL_KEYS.status,
    OCCURRENCE_STATUS_FILTER_MAP,
    occurrenceFilterInitialValues,
  );

  return {
    ...occurrenceFilterInitialValues,
    ...statusFields,
    title: parseStringParam(params.get('title')),
    protocol: parseStringParam(params.get('protocol')),
    clientIds: parseArrayField(params, 'clientIds'),
    userIds: parseArrayField(params, 'userIds'),
    startDate: parseDateOnlyParam(params.get('startDate')),
    endDate: parseDateOnlyParam(params.get('endDate')),
  };
}

export function serializeOccurrenceFilterToUrl(
  filter: OccurrenceFilterDto,
): Record<string, string | undefined> {
  return {
    [LIST_URL_KEYS.status]: serializeStatusFilter(
      filter,
      OCCURRENCE_STATUS_FILTER_MAP,
      occurrenceFilterInitialValues,
    ),
    title: serializeStringParam(filter.title),
    protocol: serializeStringParam(filter.protocol),
    clientIds: serializeArrayField(filter.clientIds),
    userIds: serializeArrayField(filter.userIds),
    startDate: serializeStringParam(filter.startDate),
    endDate: serializeStringParam(filter.endDate),
  };
}

export function parseFinanceFilterFromUrl(
  params: URLSearchParams,
): FinanceFilterDto {
  const defaults = makeFinanceFilterInitialValues();
  const flows = parseArrayField(params, 'flows');

  return {
    ...defaults,
    flow: (params.get('flow') as FinanceFilterDto['flow']) || undefined,
    flows: flows.length
      ? (flows as NonNullable<FinanceFilterDto['flows']>)
      : undefined,
    status: (params.get('status') as FinanceFilterDto['status']) || undefined,
    typeIds: parseArrayField(params, 'typeIds'),
    bankIds: parseArrayField(params, 'bankIds'),
    categoryIds: parseArrayField(params, 'categoryIds'),
    segmentIds: parseArrayField(params, 'segmentIds'),
    payeeIds: parseArrayField(params, 'payeeIds'),
    dateFrom: parseStringParam(params.get('dateFrom'), defaults.dateFrom),
    dateTo: parseStringParam(params.get('dateTo'), defaults.dateTo),
  };
}

export function serializeFinanceFilterToUrl(
  filter: FinanceFilterDto,
): Record<string, string | undefined> {
  const defaults = makeFinanceFilterInitialValues();

  return {
    flow: filter.flow,
    flows: serializeArrayField(filter.flows),
    status: filter.status,
    typeIds: serializeArrayField(filter.typeIds),
    bankIds: serializeArrayField(filter.bankIds),
    categoryIds: serializeArrayField(filter.categoryIds),
    segmentIds: serializeArrayField(filter.segmentIds),
    payeeIds: serializeArrayField(filter.payeeIds),
    dateFrom:
      filter.dateFrom !== defaults.dateFrom ? filter.dateFrom : undefined,
    dateTo: filter.dateTo !== defaults.dateTo ? filter.dateTo : undefined,
  };
}

export function parseContractFilterFromUrl(
  params: URLSearchParams,
): ContractFilterDto {
  return {
    clientIds: parseArrayField(params, 'clientIds'),
    typeIds: parseArrayField(params, 'typeIds'),
  };
}

export function serializeContractFilterToUrl(
  filter: ContractFilterDto,
): Record<string, string | undefined> {
  return {
    clientIds: serializeArrayField(filter.clientIds),
    typeIds: serializeArrayField(filter.typeIds),
  };
}

export type AttendanceUrlState = {
  statuses: string[];
  companyIds: string[];
  search: string;
  dateLte?: Date;
};

export function parseAttendanceFilterFromUrl(
  params: URLSearchParams,
): AttendanceUrlState {
  const statuses = parseCommaList(params.get(LIST_URL_KEYS.status));

  return {
    statuses: statuses.length ? statuses : [...DEFAULT_ATTENDANCE_STATUSES],
    companyIds: parseArrayField(params, 'companyIds'),
    search: parseSearchParam(params),
    dateLte: parseIsoDateParam(params.get('dateLte')),
  };
}

export function serializeAttendanceFilterToUrl(
  state: AttendanceUrlState,
): Record<string, string | undefined> {
  return {
    [LIST_URL_KEYS.status]: arraysEqual(state.statuses, DEFAULT_ATTENDANCE_STATUSES)
      ? undefined
      : state.statuses.join(','),
    companyIds: serializeArrayField(state.companyIds),
    dateLte: serializeIsoDateParam(state.dateLte),
  };
}

export function buildListUrlQuery(
  options: {
    q?: string;
    pageIndex?: number;
    pageSize?: number;
    defaultPageSize?: number;
    filterParams?: Record<string, string | undefined>;
  },
): string {
  const defaultPageSize = options.defaultPageSize ?? 30;
  const params = mergeUrlParams({
    [LIST_URL_KEYS.q]: serializeSearchParam(options.q ?? ''),
    [LIST_URL_KEYS.page]:
      (options.pageIndex ?? 0) > 0
        ? String((options.pageIndex ?? 0) + 1)
        : undefined,
    [LIST_URL_KEYS.pageSize]:
      (options.pageSize ?? defaultPageSize) !== defaultPageSize
        ? String(options.pageSize)
        : undefined,
    ...(options.filterParams ?? {}),
  });

  return params.toString();
}

export function hasActiveFilterParams(
  filterParams: Record<string, string | undefined>,
  q = '',
): boolean {
  if (q.trim()) return true;
  return Object.values(filterParams).some(
    (value) => value !== undefined && value !== '',
  );
}
