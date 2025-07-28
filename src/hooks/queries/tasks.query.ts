import { taskService } from '@/features/task/services';
import { useQuery } from '@tanstack/react-query';

export function useTasksQuery() {
  return useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      const tasks = await taskService.get({});
      return tasks;
    },
    initialData: { count: 0, data: [] },
    refetchOnWindowFocus: false,
  });
}
