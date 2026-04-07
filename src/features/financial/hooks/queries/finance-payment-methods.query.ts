import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { FinancePaymentMethodFormDto } from '../../schemas/finance-payment-method-drawer.schema';
import { financePaymentMethodService } from '../../services/finance-payment-method.service';
import type { FinancePaymentMethod } from '../../types/finance-payment-method';

type FinancePaymentMethodMutationInput = {
  type: 'create' | 'update' | 'delete';
  id?: string;
  data?: FinancePaymentMethodFormDto;
};

export function useFinancePaymentMethodsQuery() {
  return useQuery({
    queryKey: ['financePaymentMethods'],
    queryFn: () => financePaymentMethodService.getAll(),
    initialData: [],
    refetchOnWindowFocus: false,
  });
}

export const useFinancePaymentMethodMutation = () => {
  const queryClient = useQueryClient();

  const mutationFn = async (
    input: FinancePaymentMethodMutationInput,
  ): Promise<FinancePaymentMethod> => {
    switch (input.type) {
      case 'create':
        return financePaymentMethodService.create(
          input.data as FinancePaymentMethodFormDto,
        );
      case 'update':
        return financePaymentMethodService.update(
          input.id as string,
          input.data as FinancePaymentMethodFormDto,
        );
      case 'delete':
        return financePaymentMethodService.delete(input.id as string);
    }
  };

  return useMutation<
    FinancePaymentMethod,
    Error,
    FinancePaymentMethodMutationInput
  >({
    mutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financePaymentMethods'] });
    },
  });
};
