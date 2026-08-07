'use client';

import { Pagination } from '@/components/common/table/table';
import { buildListUrlQuery } from '@/utils/list-url-serializers';
import {
  hasNonDefaultUrlParams,
  parsePageParams,
  parseSearchParam,
} from '@/utils/list-url-state';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
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
  const router = useRouter();

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
      router.replace(nextUrl, { scroll: false });
    },
    [defaultPageSize, pathname, router, serializeFilter],
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
  urlState,
  state,
  syncUrl,
  onApplyFromUrl,
}: UseListUrlEffectsOptions<TFilter>) {
  const appliedFromUrlRef = useRef(false);
  const skipNextSyncRef = useRef(hasUrlParams);

  useEffect(() => {
    if (!hasUrlParams || appliedFromUrlRef.current || !onApplyFromUrl) {
      return;
    }

    appliedFromUrlRef.current = true;
    void onApplyFromUrl(
      urlState.filter,
      urlState.q,
      urlState.pagination.pageIndex + 1,
    );
  }, [hasUrlParams, onApplyFromUrl, urlState]);

  useEffect(() => {
    if (skipNextSyncRef.current) {
      skipNextSyncRef.current = false;
      return;
    }

    syncUrl(state);
  }, [state, syncUrl]);
}
