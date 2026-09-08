import { Task, TaskStatusEnum } from '@/features/task/types';
import { buildTextSearchOrFilter, pushOrFilterGroups } from '@/utils/query';
import { useMeQuery } from '@/hooks/queries/me.query';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import {
  attendanceService,
  attendanceTaskQuery,
} from '../../services/attendance.service';

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

export const ACTIVE_STATUSES = DEFAULT_ATTENDANCE_STATUSES;

export const CLOSED_STATUSES = ['CLOSED', 'REJECTED'];

export type AttendanceFilters = {
  statuses?: string[];
  companyIds?: string[];
  search?: string;
  dateLte?: Date;
};

export type TaskWithCompany = Task & { companyId: string; companyName: string };

export function useAttendanceTasksQuery(filters: AttendanceFilters = {}) {
  const { data: me, isLoading: meLoading } = useMeQuery();

  const writableCompanies = useMemo(() => {
    if (!me?.companyUser) return [];
    return (me.companyUser as any[]).map((cu: any) => ({
      companyId: cu.companyId,
      companyName: cu.company?.name ?? cu.companyId,
    }));
  }, [me]);

  const filteredCompanies = useMemo(() => {
    if (!filters.companyIds?.length) return writableCompanies;
    return writableCompanies.filter((c) =>
      filters.companyIds!.includes(c.companyId),
    );
  }, [filters.companyIds, writableCompanies]);

  return useQuery<TaskWithCompany[]>({
    queryKey: [
      'attendance-tasks',
      filteredCompanies.map((c) => c.companyId),
      filters,
    ],
    queryFn: async () => {
      if (!filteredCompanies.length) return [];

      const results = await Promise.all(
        filteredCompanies.map(async ({ companyId, companyName }) => {
          const query = { ...attendanceTaskQuery, filter: [] as any[] };

          // Status filter — use provided list (always set, defaults to ACTIVE_STATUSES)
          const statusList = filters.statuses?.length
            ? filters.statuses
            : ACTIVE_STATUSES;
          const statusOrItems = statusList.map((s) => ({
            path: 'status',
            operator: 'equals' as const,
            value: s,
          }));
          const searchOrItems = filters.search
            ? buildTextSearchOrFilter(filters.search, ['title', 'protocol'], {
                withClientName: true,
              })
            : [];

          pushOrFilterGroups(query.filter, statusOrItems, searchOrItems);

          // Date ceiling filter
          if (filters.dateLte) {
            query.filter.push({
              path: 'date',
              operator: 'lte' as any,
              value: filters.dateLte,
              filterGroup: 'and' as any,
            });
          }

          const response = await attendanceService.getTasks(companyId, query);
          const items: Task[] = (response as any)?.data ?? response ?? [];
          return items.map((t) => ({ ...t, companyId, companyName }));
        }),
      );

      const all = results.flat();
      all.sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
      );
      return all;
    },
    enabled: !meLoading && filteredCompanies.length > 0,
    staleTime: 30_000,
  });
}
