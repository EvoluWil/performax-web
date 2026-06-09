import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CreateReceivableDto } from '../../types/finance-receivable';
import { financeReceivableService } from '../../services/finance-receivable.service';

export function useFinanceReceivablesQuery() {
  return useQuery({
    queryKey: ['financeReceivables'],
    queryFn: () => financeReceivableService.getAll(),
    initialData: [],
    refetchOnWindowFocus: false,
  });
}

export function useFinanceReceivableMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      input:
        | { type: 'create'; data: CreateReceivableDto }
        | { type: 'delete'; id: string },
    ) => {
      if (input.type === 'create') {
        return financeReceivableService.create(input.data);
      }
      return financeReceivableService.delete(input.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financeReceivables'] });
      queryClient.invalidateQueries({ queryKey: ['finances'] });
    },
  });
}
