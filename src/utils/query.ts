import { Query } from "nestjs-prisma-querybuilder-interface";

type ScopedFilterOptions = {
  field: string;
  operator?: "in" | "hasSome";
  filterGroup?: "and" | "or";
};

/**
 * Applies a scoped filter to a query. Returns null when there are no permitted ids.
 */
export const applyScopedFilter = (
  baseQuery: Query,
  scopedUserIds: string[] | null,
  { field, operator = "in", filterGroup = "and" }: ScopedFilterOptions
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
    value: scopedUserIds,
    filterGroup,
  });

  return query;
};
