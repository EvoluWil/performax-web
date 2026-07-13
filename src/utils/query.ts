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
