'use client';

import { Pagination } from '@/components/common/table/table';
import { buildListUrlQuery } from '@/utils/list-url-serializers';
import {
  hasNonDefaultUrlParams,
  parsePageParams,
  parseSearchParam,
} from '@/utils/list-url-state';
import { usePathname, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef } from 'react';

type UseListUrlStateOptions<TFilter> = {
  defaultFilter: TFilter;
  defaultPageSize?: number;
  parseFilter: (params: URLSearchParams) => TFilter;
  serializeFilter: (filter: TFilter) => Record<string, string | undefined>;
};

export function useListUrlState<TFilter>({
  defaultFilter,
  defaultPageSize = 30,
  parseFilter,
  serializeFilter,
}: UseListUrlStateOptions<TFilter>) {
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const parsed = useMemo(() => {
    const pagination = parsePageParams(searchParams, defaultPageSize);

    return {
      q: parseSearchParam(searchParams),
      pagination,
      filter: parseFilter(searchParams),
      hasUrlParams: hasNonDefaultUrlParams(searchParams),
    };
  }, [searchParams, defaultPageSize, parseFilter]);

  const lastSyncedRef = useRef<string>('');

  const syncUrl = useCallback(
    (state: {
      q: string;
      pagination: Pagination;
      filter: TFilter;
    }) => {
      const query = buildListUrlQuery({
        q: state.q,
        pageIndex: state.pagination.pageIndex,
        pageSize: state.pagination.pageSize,
        defaultPageSize,
        filterParams: serializeFilter(state.filter),
      });

      const nextUrl = query ? `${pathname}?${query}` : pathname;

      if (lastSyncedRef.current === nextUrl) {
        return;
      }

      lastSyncedRef.current = nextUrl;

      // Use history.replaceState instead of router.replace to keep the URL
      // shareable without triggering a Next.js RSC refetch that remounts
      // client state and clears in-flight filtered results.
      if (typeof window !== 'undefined') {
        window.history.replaceState(window.history.state, '', nextUrl);
      }
    },
    [defaultPageSize, pathname, serializeFilter],
  );

  return {
    ...parsed,
    syncUrl,
  };
}

type UseSimpleListUrlStateOptions = {
  defaultPageSize?: number;
};

export function useSimpleListUrlState({
  defaultPageSize = 30,
}: UseSimpleListUrlStateOptions = {}) {
  return useListUrlState({
    defaultFilter: {},
    defaultPageSize,
    parseFilter: () => ({}),
    serializeFilter: () => ({}),
  });
}

type UseListUrlEffectsOptions<TFilter> = {
  hasUrlParams: boolean;
  isReady?: boolean;
  urlState: {
    q: string;
    pagination: Pagination;
    filter: TFilter;
  };
  state: {
    q: string;
    pagination: Pagination;
    filter: TFilter;
  };
  syncUrl: (state: {
    q: string;
    pagination: Pagination;
    filter: TFilter;
  }) => void;
  onApplyFromUrl?: (
    filter: TFilter,
    q: string,
    page: number,
  ) => void | Promise<void>;
};

export function useListUrlEffects<TFilter>({
  hasUrlParams,
  isReady = true,
  urlState,
  state,
  syncUrl,
  onApplyFromUrl,
}: UseListUrlEffectsOptions<TFilter>) {
  const appliedFromUrlRef = useRef(false);
  const skipNextSyncRef = useRef(hasUrlParams);

  useEffect(() => {
    if (
      !hasUrlParams ||
      !isReady ||
      appliedFromUrlRef.current ||
      !onApplyFromUrl
    ) {
      return;
    }

    appliedFromUrlRef.current = true;
    void onApplyFromUrl(
      urlState.filter,
      urlState.q,
      urlState.pagination.pageIndex + 1,
    );
  }, [
    hasUrlParams,
    isReady,
    onApplyFromUrl,
    urlState.filter,
    urlState.q,
    urlState.pagination.pageIndex,
  ]);

  useEffect(() => {
    if (skipNextSyncRef.current) {
      skipNextSyncRef.current = false;
      return;
    }

    syncUrl(state);
  }, [
    state.q,
    state.pagination.pageIndex,
    state.pagination.pageSize,
    state.filter,
    syncUrl,
  ]);
}
