import { TaskDetail } from "@/features/task/pages";
import { taskService } from "@/features/task/services";
import { QueryClient } from "@tanstack/react-query";

type Props = {
  params: Promise<{ taskId: string }>;
};

export default async function TaskDetailPage({ params }: Props) {
  const { taskId } = await params;
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["task-detail", taskId],
    queryFn: () => taskService.getById(taskId),
  });

  return <TaskDetail />;
}
