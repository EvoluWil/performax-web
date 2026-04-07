import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { FinanceTypeFormDto } from '../../schemas/finance-type-drawer.schema';
import { financeTypeService } from '../../services/finance-type.service';
import type { FinanceType } from '../../types/finance-type';

type FinanceTypeMutationInput = {
  type: 'create' | 'update' | 'delete';
  id?: string;
  data?: FinanceTypeFormDto;
};

export function useFinanceTypesQuery() {
  return useQuery({
    queryKey: ['financeTypes'],
    queryFn: () => financeTypeService.getAll(),
    initialData: [],
    refetchOnWindowFocus: false,
  });
}

export const useFinanceTypeMutation = () => {
  const queryClient = useQueryClient();

  const mutationFn = async (
    input: FinanceTypeMutationInput,
  ): Promise<FinanceType> => {
    switch (input.type) {
      case 'create':
        return financeTypeService.create(input.data as FinanceTypeFormDto);
      case 'update':
        return financeTypeService.update(
          input.id as string,
          input.data as FinanceTypeFormDto,
        );
      case 'delete':
        return financeTypeService.delete(input.id as string);
    }
  };

  return useMutation<FinanceType, Error, FinanceTypeMutationInput>({
    mutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financeTypes'] });
    },
  });
};
