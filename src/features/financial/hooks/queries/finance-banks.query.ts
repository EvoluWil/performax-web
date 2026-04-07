import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { FinanceBankFormDto } from '../../schemas/finance-bank-drawer.schema';
import { financeBankService } from '../../services/finance-bank.service';
import type { FinanceBank } from '../../types/finance-bank';

type FinanceBankMutationInput = {
  type: 'create' | 'update' | 'delete';
  id?: string;
  data?: FinanceBankFormDto;
};

export function useFinanceBanksQuery() {
  return useQuery({
    queryKey: ['financeBanks'],
    queryFn: () => financeBankService.getAll(),
    initialData: [],
    refetchOnWindowFocus: false,
  });
}

export const useFinanceBankMutation = () => {
  const queryClient = useQueryClient();

  const mutationFn = async (
    input: FinanceBankMutationInput,
  ): Promise<FinanceBank> => {
    switch (input.type) {
      case 'create':
        return financeBankService.create(input.data as FinanceBankFormDto);
      case 'update':
        return financeBankService.update(
          input.id as string,
          input.data as FinanceBankFormDto,
        );
      case 'delete':
        return financeBankService.delete(input.id as string);
    }
  };

  return useMutation<FinanceBank, Error, FinanceBankMutationInput>({
    mutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financeBanks'] });
    },
  });
};
