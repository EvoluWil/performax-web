import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { FinanceRecurringFormDto } from '../../schemas/finance-recurring-drawer.schema';
import { financeRecurringService } from '../../services/finance-recurring.service';
import type { FinanceRecurring } from '../../types/finance-recurring';

type FinanceRecurringMutationInput = {
  type: 'create' | 'update' | 'delete' | 'process';
  id?: string;
  data?: FinanceRecurringFormDto;
};

export function useFinanceRecurringsQuery() {
  return useQuery({
    queryKey: ['financeRecurrings'],
    queryFn: () => financeRecurringService.getAll(),
    initialData: [],
    refetchOnWindowFocus: false,
  });
}

export const useFinanceRecurringMutation = () => {
  const queryClient = useQueryClient();

  const mutationFn = async (
    input: FinanceRecurringMutationInput,
  ): Promise<FinanceRecurring | void> => {
    switch (input.type) {
      case 'create':
        return financeRecurringService.create(input.data as any);
      case 'update':
        return financeRecurringService.update(
          input.id as string,
          input.data as any,
        );
      case 'delete':
        return financeRecurringService.delete(input.id as string);
      case 'process':
        return financeRecurringService.process();
    }
  };

  return useMutation<
    FinanceRecurring | void,
    Error,
    FinanceRecurringMutationInput
  >({
    mutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financeRecurrings'] });
      queryClient.invalidateQueries({ queryKey: ['finances'] });
    },
  });
};
