import { TaskTypeFormDto } from '@/features/task/schemas';
import { taskTypeService } from '@/features/task/services';
import { TaskType } from '@/features/task/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

type TaskTypeMutationInput = {
  type: 'create' | 'update' | 'delete';
  id?: string;
  data?: TaskTypeFormDto;
};

export function useTaskTypesQuery() {
  return useQuery({
    queryKey: ['taskTypes'],
    queryFn: async () => {
      const types = await taskTypeService.get();
      return types;
    },
    initialData: [],
    refetchOnWindowFocus: false,
  });
}

export const useTaskTypeMutation = () => {
  const queryClient = useQueryClient();

  const mutationFn = async (
    input: TaskTypeMutationInput,
  ): Promise<TaskType> => {
    switch (input.type) {
      case 'create':
        return taskTypeService.create(input?.data as TaskTypeFormDto);
      case 'update':
        return taskTypeService.update(
          input?.id as string,
          input?.data as TaskTypeFormDto,
        );
      case 'delete':
        return taskTypeService.delete(input?.id as string);
    }
  };

  return useMutation<TaskType, Error, TaskTypeMutationInput>({
    mutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['taskTypes'] });
    },
  });
};
