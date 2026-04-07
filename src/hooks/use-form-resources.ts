'use client';

import {
  FormResourcesResult,
  ResourceItem,
  ResourceKey,
  fetchFormResources,
} from '@/services/form-resources.service';
import { useQuery } from '@tanstack/react-query';
import { useCallback, useState } from 'react';

export type FormResourceOption = {
  value: string;
  label: string;
  data?: Record<string, unknown>;
};

type SearchState = Partial<Record<ResourceKey, string>>;

type UseFormResourcesReturn = {
  /** TanStack-cached option map ready for AutocompleteInput */
  options: Partial<Record<ResourceKey, FormResourceOption[]>>;
  /** Raw data from the API (items with full fields) */
  raw: FormResourcesResult;
  /** Set the search term for one resource (triggers a targeted refetch) */
  setSearch: (resource: ResourceKey, value: string) => void;
  isLoading: boolean;
};

function toOptions(
  items: ResourceItem[] | undefined,
  resource: ResourceKey,
): FormResourceOption[] {
  if (!items?.length) return [];
  return items.map((item) => {
    let label = item.name;
    // financeBanks: include code in label
    if (resource === 'financeBanks' && item.code) {
      label = `${item.name} (${item.code})`;
    }
    const { id, ...rest } = item;
    return {
      value: id,
      label,
      data: Object.keys(rest).length
        ? (rest as Record<string, unknown>)
        : undefined,
    };
  });
}

/**
 * Generic hook that fetches form-select resources from a single API endpoint.
 *
 * Usage:
 *   const { options, setSearch } = useFormResources(['users', 'clients']);
 *   // in AutocompleteInput onInputChange:
 *   setSearch('users', inputValue);
 */
export function useFormResources(
  resources: ResourceKey[],
): UseFormResourcesReturn {
  const [search, setSearchState] = useState<SearchState>({});

  const setSearch = useCallback((resource: ResourceKey, value: string) => {
    setSearchState((prev) => ({ ...prev, [resource]: value }));
  }, []);

  // Stable sorted key so cache doesn't fragment on resource array order
  const sortedResources = [...resources].sort();

  const { data, isLoading } = useQuery({
    queryKey: ['formResources', sortedResources, search],
    queryFn: () =>
      fetchFormResources({
        resources: sortedResources,
        search,
      }),
    staleTime: 30_000, // 30s — resources are fairly static
    placeholderData: (prev) => prev, // keep previous options while reloading
    refetchOnWindowFocus: false,
  });

  const options: Partial<Record<ResourceKey, FormResourceOption[]>> = {};
  for (const key of resources) {
    options[key] = toOptions(data?.[key], key);
  }

  return {
    options,
    raw: data ?? {},
    setSearch,
    isLoading,
  };
}
