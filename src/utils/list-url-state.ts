export const LIST_URL_KEYS = {
  q: 'q',
  page: 'page',
  pageSize: 'pageSize',
  status: 'status',
} as const;

export type ListUrlPagination = {
  pageIndex: number;
  pageSize: number;
};

export function parseCommaList(value: string | null): string[] {
  if (!value) return [];
  return value.split(',').map((item) => item.trim()).filter(Boolean);
}

export function serializeCommaList(value?: string[] | null): string | undefined {
  if (!value?.length) return undefined;
  return value.join(',');
}

export function parseBooleanParam(
  value: string | null,
  defaultValue: boolean,
): boolean {
  if (value === null) return defaultValue;
  return value === '1' || value === 'true';
}

export function serializeBooleanParam(
  value: boolean,
  defaultValue: boolean,
): string | undefined {
  if (value === defaultValue) return undefined;
  return value ? '1' : '0';
}

export function parseStringParam(
  value: string | null,
  defaultValue = '',
): string {
  return value ?? defaultValue;
}

export function serializeStringParam(
  value: string | undefined | null,
  defaultValue = '',
): string | undefined {
  const normalized = value?.trim() ?? '';
  if (!normalized || normalized === defaultValue) return undefined;
  return normalized;
}

export function parseDateOnlyParam(value: string | null): string {
  return value ?? '';
}

export function serializeDateOnlyParam(
  value: Date | string | null | undefined,
): string | undefined {
  if (!value) return undefined;

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;

  return date.toISOString().slice(0, 10);
}

export function parseIsoDateParam(value: string | null): Date | undefined {
  if (!value) return undefined;

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

export function serializeIsoDateParam(
  value: Date | undefined,
): string | undefined {
  if (!value) return undefined;
  return value.toISOString();
}

export function parsePageParams(
  params: URLSearchParams,
  defaultPageSize = 30,
): ListUrlPagination {
  const page = Number.parseInt(params.get(LIST_URL_KEYS.page) ?? '1', 10);
  const pageSize = Number.parseInt(
    params.get(LIST_URL_KEYS.pageSize) ?? String(defaultPageSize),
    10,
  );

  return {
    pageIndex: Number.isFinite(page) && page > 0 ? page - 1 : 0,
    pageSize: Number.isFinite(pageSize) && pageSize > 0 ? pageSize : defaultPageSize,
  };
}

export function serializePageParams(
  pagination: ListUrlPagination,
  defaultPageSize = 30,
): Record<string, string | undefined> {
  return {
    [LIST_URL_KEYS.page]:
      pagination.pageIndex > 0 ? String(pagination.pageIndex + 1) : undefined,
    [LIST_URL_KEYS.pageSize]:
      pagination.pageSize !== defaultPageSize
        ? String(pagination.pageSize)
        : undefined,
  };
}

export function parseSearchParam(params: URLSearchParams): string {
  return parseStringParam(params.get(LIST_URL_KEYS.q));
}

export function serializeSearchParam(term: string): string | undefined {
  return serializeStringParam(term);
}

export function arraysEqual(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  const sortedA = [...a].sort();
  const sortedB = [...b].sort();
  return sortedA.every((value, index) => value === sortedB[index]);
}

export function serializeStatusFilter<TField extends string>(
  data: Record<TField, boolean>,
  statusMap: Array<{ status: string; field: TField }>,
  defaults: Record<TField, boolean>,
): string | undefined {
  const active = statusMap
    .filter(({ field }) => data[field])
    .map(({ status }) => status);
  const defaultActive = statusMap
    .filter(({ field }) => defaults[field])
    .map(({ status }) => status);

  if (arraysEqual(active, defaultActive)) return undefined;
  return active.join(',');
}

export function parseStatusFilter<TField extends string>(
  params: URLSearchParams,
  key: string,
  statusMap: Array<{ status: string; field: TField }>,
  defaults: Record<TField, boolean>,
): Record<TField, boolean> {
  const raw = params.get(key);
  if (!raw) {
    return { ...defaults };
  }

  const activeSet = new Set(parseCommaList(raw));
  const result = { ...defaults };

  for (const { status, field } of statusMap) {
    result[field] = activeSet.has(status);
  }

  return result;
}

export function mergeUrlParams(
  entries: Record<string, string | undefined>,
): URLSearchParams {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(entries)) {
    if (value !== undefined && value !== '') {
      params.set(key, value);
    }
  }

  return params;
}

export function hasNonDefaultUrlParams(
  params: URLSearchParams,
  ignoredKeys: string[] = [],
): boolean {
  const ignored = new Set(ignoredKeys);

  for (const key of params.keys()) {
    if (!ignored.has(key)) {
      return true;
    }
  }

  return false;
}
