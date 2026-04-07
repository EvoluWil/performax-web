import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { FinanceCategoryFormDto } from '../../schemas/finance-category-drawer.schema';
import { financeCategoryService } from '../../services/finance-category.service';
import type { FinanceCategory } from '../../types/finance-category';

type FinanceCategoryMutationInput = {
  type: 'create' | 'update' | 'delete';
  id?: string;
  data?: FinanceCategoryFormDto;
};

export function useFinanceCategoriesQuery() {
  return useQuery({
    queryKey: ['financeCategories'],
    queryFn: () => financeCategoryService.getAll(),
    initialData: [],
    refetchOnWindowFocus: false,
  });
}

export const useFinanceCategoryMutation = () => {
  const queryClient = useQueryClient();

  const mutationFn = async (
    input: FinanceCategoryMutationInput,
  ): Promise<FinanceCategory> => {
    switch (input.type) {
      case 'create':
        return financeCategoryService.create(
          input.data as FinanceCategoryFormDto,
        );
      case 'update':
        return financeCategoryService.update(
          input.id as string,
          input.data as FinanceCategoryFormDto,
        );
      case 'delete':
        return financeCategoryService.delete(input.id as string);
    }
  };

  return useMutation<FinanceCategory, Error, FinanceCategoryMutationInput>({
    mutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financeCategories'] });
    },
  });
};
