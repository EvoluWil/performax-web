'use client';

import { useMeQuery } from '@/hooks/queries/me.query';
import { useMemo, useState } from 'react';
import {
  AttendanceFilters,
  CLOSED_STATUSES,
  useAttendanceTasksQuery,
} from '../../hooks/queries/attendance-tasks.query';

export type StatusGroup = 'pending' | 'in_progress' | 'closed';

export const STATUS_GROUP_MAP: Record<StatusGroup, string[]> = {
  pending: [
    'PENDING',
    'APPROVED',
    'OPEN',
    'EMERGENCY',
    'SCHEDULED',
    'IMPEDED',
    'EXPIRED',
  ],
  in_progress: ['IN_PROGRESS'],
  closed: [...CLOSED_STATUSES],
};

function todayEnd(): Date {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d;
}

const DEFAULT_STATUS_GROUPS: StatusGroup[] = ['pending', 'in_progress'];

export function useAttendanceList() {
  const [statusGroups, setStatusGroups] = useState<StatusGroup[]>(
    DEFAULT_STATUS_GROUPS,
  );
  const [companyIds, setCompanyIds] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [dateLte, setDateLte] = useState<Date>(todayEnd());

  const { data: me } = useMeQuery();

  const availableCompanies = useMemo(() => {
    if (!me?.companyUser) return [];
    return (me.companyUser as any[]).map((cu: any) => ({
      id: cu.companyId,
      name: cu.company?.name ?? cu.companyId,
    }));
  }, [me]);

  const resolvedStatuses = useMemo(
    () => statusGroups.flatMap((g) => STATUS_GROUP_MAP[g]),
    [statusGroups],
  );

  const activeFilters: AttendanceFilters = useMemo(
    () => ({
      statuses: resolvedStatuses,
      companyIds: companyIds.length ? companyIds : undefined,
      search: search || undefined,
      dateLte,
    }),
    [resolvedStatuses, companyIds, search, dateLte],
  );

  const {
    data: tasks = [],
    isLoading,
    refetch,
  } = useAttendanceTasksQuery(activeFilters);

  const toggleStatusGroup = (groups: string | string[]) => {
    const arr = (Array.isArray(groups) ? groups : [groups]) as StatusGroup[];
    setStatusGroups(arr.length ? arr : DEFAULT_STATUS_GROUPS);
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
    setStatusGroups(DEFAULT_STATUS_GROUPS);
    setCompanyIds([]);
    setDateLte(todayEnd());
  };

  const isFiltered =
    !!search ||
    !!companyIds.length ||
    dateLte.toDateString() !== todayEnd().toDateString() ||
    statusGroups.length !== DEFAULT_STATUS_GROUPS.length ||
    statusGroups.some((g) => !DEFAULT_STATUS_GROUPS.includes(g));

  return {
    tasks,
    isLoading,
    refetch,
    search,
    setSearch,
    statusGroups,
    toggleStatusGroup,
    companyIds,
    setCompanyFilter,
    shiftDate,
    dateLte,
    clearFilters,
    isFiltered,
    availableCompanies,
  };
}
