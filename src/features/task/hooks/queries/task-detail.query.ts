import { taskService } from "@/features/task/services";
import { useQuery } from "@tanstack/react-query";

export function useTaskDetailQuery(taskId: string) {
  return useQuery({
    queryKey: ["task-detail", taskId],
    queryFn: async () => {
      const task = await taskService.getById(taskId);
      return task;
    },
    initialData: null,
    refetchOnWindowFocus: false,
  });
}
