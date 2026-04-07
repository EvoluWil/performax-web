import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { FinanceSegmentFormDto } from '../../schemas/finance-segment-drawer.schema';
import { financeSegmentService } from '../../services/finance-segment.service';
import type { FinanceSegment } from '../../types/finance-segment';

type FinanceSegmentMutationInput = {
  type: 'create' | 'update' | 'delete';
  id?: string;
  data?: FinanceSegmentFormDto;
};

export function useFinanceSegmentsQuery() {
  return useQuery({
    queryKey: ['financeSegments'],
    queryFn: () => financeSegmentService.getAll(),
    initialData: [],
    refetchOnWindowFocus: false,
  });
}

export const useFinanceSegmentMutation = () => {
  const queryClient = useQueryClient();

  const mutationFn = async (
    input: FinanceSegmentMutationInput,
  ): Promise<FinanceSegment> => {
    switch (input.type) {
      case 'create':
        return financeSegmentService.create(
          input.data as FinanceSegmentFormDto,
        );
      case 'update':
        return financeSegmentService.update(
          input.id as string,
          input.data as FinanceSegmentFormDto,
        );
      case 'delete':
        return financeSegmentService.delete(input.id as string);
    }
  };

  return useMutation<FinanceSegment, Error, FinanceSegmentMutationInput>({
    mutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financeSegments'] });
    },
  });
};
