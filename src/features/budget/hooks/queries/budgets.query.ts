import { useCompanyPermissions } from '@/hooks/common/permission';
import { applyScopedFilter } from '@/utils/query';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import type { BudgetFormDto } from '../../schemas/budget-drawer.schema';
import { budgetService, getBudgetQuery } from '../../services/budget.service';
import type { Budget } from '../../types/budget';

export function useBudgetsQuery() {
  const { getScopedUserIds, userId } = useCompanyPermissions();

  const scopedUserIds = useMemo(
    () => getScopedUserIds('budget'),
    [getScopedUserIds],
  );

  const scopedQuery = useMemo(() => {
    const baseQuery = {
      ...getBudgetQuery,
      filter: getBudgetQuery.filter ? [...getBudgetQuery.filter] : [],
    };

    return applyScopedFilter(baseQuery, scopedUserIds, userId, {
      field: 'responsibleId',
      operator: 'in',
    });
  }, [scopedUserIds, userId]);

  const enabled = scopedQuery !== null;

  return useQuery({
    queryKey: ['budgets', scopedQuery ?? 'no-access'],
    queryFn: async () => {
      if (!scopedQuery) {
        return { data: [], count: 0 };
      }
      return budgetService.get(scopedQuery);
    },
    enabled,
    initialData: { count: 0, data: [] },
    refetchOnWindowFocus: false,
  });
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
