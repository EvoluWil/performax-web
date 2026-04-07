import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { FinancePayeeFormDto } from '../../schemas/finance-payee-drawer.schema';
import { financePayeeService } from '../../services/finance-payee.service';
import type { FinancePayee } from '../../types/finance-payee';

type FinancePayeeMutationInput = {
  type: 'create' | 'update' | 'delete';
  id?: string;
  data?: FinancePayeeFormDto;
};

export function useFinancePayeesQuery() {
  return useQuery({
    queryKey: ['financePayees'],
    queryFn: () => financePayeeService.getAll(),
    initialData: [],
    refetchOnWindowFocus: false,
  });
}

export const useFinancePayeeMutation = () => {
  const queryClient = useQueryClient();

  const mutationFn = async (
    input: FinancePayeeMutationInput,
  ): Promise<FinancePayee> => {
    switch (input.type) {
      case 'create':
        return financePayeeService.create(input.data as FinancePayeeFormDto);
      case 'update':
        return financePayeeService.update(
          input.id as string,
          input.data as FinancePayeeFormDto,
        );
      case 'delete':
        return financePayeeService.delete(input.id as string);
    }
  };

  return useMutation<FinancePayee, Error, FinancePayeeMutationInput>({
    mutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financePayees'] });
    },
  });
};
