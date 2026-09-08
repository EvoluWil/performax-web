import { Filter, Query } from 'nestjs-prisma-querybuilder-interface';

type TextSearchOptions = {
  withClientName?: boolean;
};

/**
 * Builds OR filters for quick text search across scalar fields and,
 * optionally, the related client's name.
 */
export const buildTextSearchOrFilter = (
  term: string,
  fields: string[],
  options?: TextSearchOptions,
): Filter => {
  const filters: Filter = fields.map((field) => ({
    path: field,
    operator: 'contains',
    value: term,
    insensitive: true,
  }));

  if (options?.withClientName) {
    filters.push({
      path: 'client',
      filter: [
        {
          path: 'name',
          operator: 'contains',
          value: term,
          insensitive: true,
        },
      ],
    } as Filter[number]);
  }

  return filters;
};

/**
 * Pushes one or more OR filter groups into the query filter.
 *
 * Each group is emitted as `{ or: [...] }`, which FilterResolver flattens into
 * leaf filters that always carry `path` (avoids "path should not be empty").
 *
 * Note: sibling `{ or }` blocks are flattened into the same OR bucket by
 * FilterResolver. True AND(OR, OR) requires a FilterResolver update in
 * nestjs-prisma-querybuilder-interface to flatten `{ and: [{ or }, { or }] }`.
 */
export function pushOrFilterGroups(
  filters: NonNullable<Query['filter']> | undefined,
  ...groups: Filter[]
): void {
  if (!filters) return;

  const orGroups = groups.filter((group) => group.length);
  if (!orGroups.length) return;

  orGroups.forEach((group) => {
    (filters as Filter).push({ or: group } as Filter[number]);
  });
}

type StatusFilterMapEntry<T> = {
  status: string;
  field: keyof T;
};

/**
 * Builds a status OR filter from boolean fields mapped to status values.
 */
export const buildStatusOrFilterFromMap = <T extends Record<string, unknown>>(
  data: T,
  map: StatusFilterMapEntry<T>[],
): Filter => {
  const statuses = map
    .filter(({ field }) => Boolean(data[field]))
    .map(({ status }) => status);

  if (!statuses.length) return [];

  return [
    {
      or: statuses.map((status) => ({
        path: 'status',
        operator: 'equals',
        value: status,
      })),
    } as Filter[number],
  ];
};

type ScopedFilterOptions = {
  field: string;
  operator?: 'in' | 'hasSome';
  filterGroup?: 'and' | 'or';
};

/**
 * Applies a scoped filter to a query. Returns null when there are no permitted ids.
 */
export const applyScopedFilter = (
  baseQuery: Query,
  scopedUserIds: string[] | null,
  userId: string = '',
  { field, operator = 'in', filterGroup = 'and' }: ScopedFilterOptions,
): Query | null => {
  const query: Query = {
    ...baseQuery,
    filter: baseQuery.filter ? [...baseQuery.filter] : [],
  };

  if (scopedUserIds === null) {
    return query;
  }

  if (!scopedUserIds.length) {
    return null;
  }

  if (!query.filter) {
    query.filter = [];
  }

  query.filter.push({
    path: field,
    operator,
    value: [...scopedUserIds, userId]?.join(';'),
    filterGroup,
  });

  return query;
};

/**
 * Pushes an `in` filter for multiselect entity filters.
 */
export const pushInFilter = (
  filters: NonNullable<Query['filter']> | undefined,
  path: string,
  values: string[] | undefined,
  filterGroup: 'and' | 'or' = 'and',
) => {
  if (!values?.length || !filters) return;

  (filters as Filter).push({
    path,
    operator: 'in',
    value: values.join(';'),
    filterGroup,
  } as Filter[number]);
};
