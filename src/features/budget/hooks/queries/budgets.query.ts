import { useCompanyPermissions } from '@/hooks/common/permission';
import { applyScopedFilter } from '@/utils/query';
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { useMemo } from 'react';
import type { BudgetFormDto } from '../../schemas/budget-drawer.schema';
import { budgetService, getBudgetQuery } from '../../services/budget.service';
import type { Budget } from '../../types/budget';

type BudgetsQueryOptions = {
  pageSize?: number;
};

export function useBudgetsQuery(options: BudgetsQueryOptions = {}) {
  const { pageSize = getBudgetQuery.limit ?? 30 } = options;
  const { getScopedUserIds, userId } = useCompanyPermissions();

  const scopedUserIds = useMemo(
    () => getScopedUserIds('budget'),
    [getScopedUserIds],
  );

  const baseScopedQuery = useMemo(() => {
    const baseQuery = {
      ...getBudgetQuery,
      filter: getBudgetQuery.filter ? [...getBudgetQuery.filter] : [],
      limit: pageSize,
    };

    return applyScopedFilter(baseQuery, scopedUserIds, userId, {
      field: 'responsibleId',
      operator: 'in',
    });
  }, [scopedUserIds, userId, pageSize]);

  const enabled = baseScopedQuery !== null;

  const query = useInfiniteQuery({
    queryKey: ['budgets', baseScopedQuery ?? 'no-access'],
    queryFn: async ({ pageParam = 1 }) => {
      if (!baseScopedQuery) {
        return { data: [], count: 0 };
      }
      return budgetService.get({ ...baseScopedQuery, page: pageParam });
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, pages) => {
      const fetched = pages.length * pageSize;
      return fetched < lastPage.count ? pages.length + 1 : undefined;
    },
    enabled,
    refetchOnWindowFocus: false,
    select: (data) => {
      const budgets = data.pages.flatMap((p) => p.data);
      const total = data.pages[0]?.count ?? 0;
      return { ...data, budgets, count: total };
    },
  });

  return query;
}

export function useBudgetDetailQuery(budgetId: string) {
  return useQuery({
    queryKey: ['budget-detail', budgetId],
    queryFn: async () => budgetService.getById(budgetId),
    enabled: !!budgetId,
    refetchOnWindowFocus: false,
  });
}

type BudgetMutationInput = {
  type: 'create' | 'update' | 'delete';
  id?: string;
  data?: Partial<BudgetFormDto>;
};

export const useBudgetMutation = (budgetId?: string) => {
  const queryClient = useQueryClient();

  const mutationFn = async (input: BudgetMutationInput): Promise<Budget> => {
    switch (input.type) {
      case 'create':
        return budgetService.create(input?.data as any);
      case 'update':
        return budgetService.update(input?.id as string, input?.data as any);
      case 'delete':
        return budgetService.delete(input?.id as string);
    }
  };

  const queryKey: (string | undefined)[] = [
    'budgets',
    'budget-detail',
    budgetId,
  ];

  return useMutation<Budget, Error, BudgetMutationInput>({
    mutationFn,
    onSuccess: () => {
      // invalidate list and optionally a detail
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      queryClient.invalidateQueries({
        queryKey: queryKey.filter(Boolean) as string[],
      });
    },
  });
};

export const useBudgetApprovalMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<Budget, Error, { id: string; approved: boolean }>({
    mutationFn: ({ id, approved }) => budgetService.approve(id, approved),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
    },
  });
};
