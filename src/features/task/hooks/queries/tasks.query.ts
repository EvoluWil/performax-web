import { TaskFormDto } from "@/features/task/schemas";
import { taskService } from "@/features/task/services";
import { Task } from "@/features/task/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

type TaskMutationInput = {
  type: "create" | "update" | "delete";
  id?: string;
  data?: Partial<TaskFormDto>;
};

export function useTasksQuery() {
  return useQuery({
    queryKey: ["tasks"],
    queryFn: async () => {
      const tasks = await taskService.get();
      return tasks;
    },
    initialData: { data: [], count: 0 },
    refetchOnWindowFocus: false,
  });
}

export const useTaskMutation = (taskId?: string) => {
  const queryClient = useQueryClient();

  const mutationFn = async (input: TaskMutationInput): Promise<Task> => {
    switch (input.type) {
      case "create":
        return taskService.create(input?.data as TaskFormDto);
      case "update":
        return taskService.update(
          input?.id as string,
          input?.data as Partial<TaskFormDto>
        );
      case "delete":
        return taskService.delete(input?.id as string);
    }
  };

  const queryKey = ["tasks", "task-detail"];

  if (taskId) {
    queryKey.push(taskId);
  }

  return useMutation<Task, Error, TaskMutationInput>({
    mutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });
};
