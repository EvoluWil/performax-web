import { Task } from '@/features/task/types';
import { useMeQuery } from '@/hooks/queries/me.query';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import {
  attendanceService,
  attendanceTaskQuery,
} from '../../services/attendance.service';

export const ACTIVE_STATUSES = [
  'PENDING',
  'APPROVED',
  'OPEN',
  'EMERGENCY',
  'SCHEDULED',
  'IMPEDED',
  'IN_PROGRESS',
  'EXPIRED',
];

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
          query.filter.push(
            ...statusList.map((s) => ({
              path: 'status',
              operator: 'equals' as any,
              value: s,
              filterGroup: 'or' as any,
            })),
          );

          // Date ceiling filter
          if (filters.dateLte) {
            query.filter.push({
              path: 'date',
              operator: 'lte' as any,
              value: filters.dateLte,
              filterGroup: 'and' as any,
            });
          }

          if (filters.search) {
            const searchFilters = [
              {
                path: 'title',
                operator: 'contains' as any,
                value: filters.search,
                filterGroup: 'or' as any,
              },
              {
                path: 'protocol',
                operator: 'contains' as any,
                value: filters.search,
                filterGroup: 'or' as any,
              },
            ];
            query.filter = [...(query.filter ?? []), ...(searchFilters as any)];
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
