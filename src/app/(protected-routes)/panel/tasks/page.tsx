import { TaskList } from '@/features/task/pages';
import { taskService } from '@/features/task/services';
import { QueryClient } from '@tanstack/react-query';

export default async function TasksPage() {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ['tasks'],
    queryFn: () => taskService.get(),
  });

  return <TaskList />;
}
