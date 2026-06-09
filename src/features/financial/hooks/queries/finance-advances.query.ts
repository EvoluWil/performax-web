import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { financeAdvanceService } from '../../services/finance-advance.service';
import { CreateAdvanceDto } from '../../types/finance-advance';

export function useFinanceAdvancesQuery() {
  return useQuery({
    queryKey: ['financeAdvances'],
    queryFn: () => financeAdvanceService.getAll(),
    initialData: [],
    refetchOnWindowFocus: false,
  });
}

export function useFinanceAdvancesAvailableQuery(enabled = true) {
  return useQuery({
    queryKey: ['financeAdvancesAvailable'],
    queryFn: () => financeAdvanceService.getAvailable(),
    initialData: [],
    enabled,
    refetchOnWindowFocus: false,
  });
}

export function useFinanceAdvanceMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      input:
        | { type: 'create'; data: CreateAdvanceDto }
        | { type: 'delete'; id: string },
    ) => {
      if (input.type === 'create') {
        return financeAdvanceService.create(input.data);
      }
      return financeAdvanceService.delete(input.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financeAdvances'] });
      queryClient.invalidateQueries({ queryKey: ['financeAdvancesAvailable'] });
      queryClient.invalidateQueries({ queryKey: ['finances'] });
      queryClient.invalidateQueries({ queryKey: ['financeWallet'] });
    },
  });
}
