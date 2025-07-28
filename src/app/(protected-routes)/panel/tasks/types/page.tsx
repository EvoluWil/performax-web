import { TaskTypeList } from '@/features/task/pages';
import { taskTypeService } from '@/features/task/services';
import { QueryClient } from '@tanstack/react-query';

export default async function TaskTypesPage() {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ['task-types'],
    queryFn: () => taskTypeService.get(),
  });

  return <TaskTypeList />;
}
