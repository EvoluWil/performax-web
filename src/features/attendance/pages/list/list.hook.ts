'use client';

import { useMeQuery } from '@/hooks/queries/me.query';
import { TaskStatusEnum, taskStatusLabels } from '@/features/task/types';
import { useMemo, useState } from 'react';
import {
  AttendanceFilters,
  useAttendanceTasksQuery,
} from '../../hooks/queries/attendance-tasks.query';

function todayEnd(): Date {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d;
}

export const ATTENDANCE_STATUS_OPTIONS = Object.values(TaskStatusEnum).map(
  (status) => ({
    value: status,
    label: taskStatusLabels[status]?.label ?? status,
  }),
);

export const DEFAULT_ATTENDANCE_STATUSES = [
  TaskStatusEnum.PENDING,
  TaskStatusEnum.APPROVED,
  TaskStatusEnum.OPEN,
  TaskStatusEnum.EMERGENCY,
  TaskStatusEnum.SCHEDULED,
  TaskStatusEnum.IMPEDED,
  TaskStatusEnum.EXPIRED,
  TaskStatusEnum.IN_PROGRESS,
];

export function useAttendanceList() {
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(
    DEFAULT_ATTENDANCE_STATUSES,
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
    setSelectedStatuses(
      statuses.length ? statuses : DEFAULT_ATTENDANCE_STATUSES,
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
