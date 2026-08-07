'use client';

import { TaskStatusEnum, taskStatusLabels } from '@/features/task/types';
import { useClosedTaskFilterAccess } from '@/hooks/common/use-closed-task-filter-access';
import { useMeQuery } from '@/hooks/queries/me.query';
import {
  buildListUrlQuery,
  parseAttendanceFilterFromUrl,
  serializeAttendanceFilterToUrl,
} from '@/utils/list-url-serializers';
import { hasNonDefaultUrlParams } from '@/utils/list-url-state';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AttendanceFilters,
  DEFAULT_ATTENDANCE_STATUSES,
  useAttendanceTasksQuery,
} from '../../hooks/queries/attendance-tasks.query';

function todayEnd(): Date {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d;
}

export function useAttendanceList() {
  const canSeeClosedFilter = useClosedTaskFilterAccess();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const parsedFromUrl = useMemo(
    () => parseAttendanceFilterFromUrl(searchParams),
    [searchParams],
  );
  const hasUrlParams = useMemo(
    () => hasNonDefaultUrlParams(searchParams),
    [searchParams],
  );

  const statusOptions = useMemo(
    () =>
      Object.values(TaskStatusEnum)
        .filter(
          (status) => canSeeClosedFilter || status !== TaskStatusEnum.CLOSED,
        )
        .map((status) => ({
          value: status,
          label: taskStatusLabels[status]?.label ?? status,
        })),
    [canSeeClosedFilter],
  );

  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(
    parsedFromUrl.statuses,
  );
  const [companyIds, setCompanyIds] = useState<string[]>(
    parsedFromUrl.companyIds,
  );
  const [search, setSearch] = useState(parsedFromUrl.search);
  const [dateLte, setDateLte] = useState<Date>(
    () => parsedFromUrl.dateLte ?? todayEnd(),
  );

  const skipNextSyncRef = useRef(hasUrlParams);
  const lastSyncedRef = useRef('');

  const syncUrl = useCallback(() => {
    const query = buildListUrlQuery({
      q: search,
      filterParams: serializeAttendanceFilterToUrl({
        statuses: selectedStatuses,
        companyIds,
        search,
        dateLte,
      }),
    });
    const nextUrl = query ? `${pathname}?${query}` : pathname;

    if (lastSyncedRef.current === nextUrl) {
      return;
    }

    lastSyncedRef.current = nextUrl;
    router.replace(nextUrl, { scroll: false });
  }, [companyIds, dateLte, pathname, router, search, selectedStatuses]);

  useEffect(() => {
    setSelectedStatuses(parsedFromUrl.statuses);
    setCompanyIds(parsedFromUrl.companyIds);
    setSearch(parsedFromUrl.search);
    setDateLte(parsedFromUrl.dateLte ?? todayEnd());
    skipNextSyncRef.current = true;
  }, [parsedFromUrl]);

  useEffect(() => {
    if (skipNextSyncRef.current) {
      skipNextSyncRef.current = false;
      return;
    }

    syncUrl();
  }, [search, selectedStatuses, companyIds, dateLte, syncUrl]);

  const { data: me } = useMeQuery();

  const availableCompanies = useMemo(() => {
    if (!me?.companyUser) return [];
    return (me.companyUser as any[]).map((cu: any) => ({
      id: cu.companyId,
      name: cu.company?.name ?? cu.companyId,
    }));
  }, [me]);

  const activeFilters: AttendanceFilters = useMemo(
    () => ({
      statuses: selectedStatuses,
      companyIds: companyIds.length ? companyIds : undefined,
      search: search || undefined,
      dateLte,
    }),
    [selectedStatuses, companyIds, search, dateLte],
  );

  const {
    data: tasks = [],
    isLoading,
    refetch,
  } = useAttendanceTasksQuery(activeFilters);

  const toggleStatuses = (statuses: string[]) => {
    const allowedStatuses = canSeeClosedFilter
      ? statuses
      : statuses.filter((status) => status !== TaskStatusEnum.CLOSED);

    setSelectedStatuses(
      allowedStatuses.length ? allowedStatuses : DEFAULT_ATTENDANCE_STATUSES,
    );
  };

  const setCompanyFilter = (ids: string[]) => setCompanyIds(ids);

  const shiftDate = (days: number) => {
    setDateLte((prev) => {
      const d = new Date(prev);
      d.setDate(d.getDate() + days);
      d.setHours(23, 59, 59, 999);
      return d;
    });
  };

  const clearFilters = () => {
    setSearch('');
    setSelectedStatuses(DEFAULT_ATTENDANCE_STATUSES);
    setCompanyIds([]);
    setDateLte(todayEnd());
  };

  const isFiltered =
    !!search ||
    !!companyIds.length ||
    dateLte.toDateString() !== todayEnd().toDateString() ||
    selectedStatuses.length !== DEFAULT_ATTENDANCE_STATUSES.length ||
    selectedStatuses.some(
      (status) => !DEFAULT_ATTENDANCE_STATUSES.includes(status),
    );

  return {
    tasks,
    isLoading,
    refetch,
    search,
    setSearch,
    statusOptions,
    selectedStatuses,
    toggleStatuses,
    companyIds,
    setCompanyFilter,
    shiftDate,
    dateLte,
    clearFilters,
    isFiltered,
    availableCompanies,
  };
}
