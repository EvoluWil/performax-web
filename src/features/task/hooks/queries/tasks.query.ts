import { TaskFormDto } from "@/features/task/schemas";
import { taskService } from "@/features/task/services";
import { getTaskQuery } from "@/features/task/services/task.service";
import { Task } from "@/features/task/types";
import { useCompanyPermissions } from "@/hooks/common/permission";
import { applyScopedFilter } from "@/utils/query";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";

type TaskMutationInput = {
  type: "create" | "update" | "delete";
  id?: string;
  data?: Partial<TaskFormDto>;
};

export function useTasksQuery() {
  const { getScopedUserIds } = useCompanyPermissions();

  const scopedUserIds = useMemo(
    () => getScopedUserIds("task"),
    [getScopedUserIds]
  );

  const scopedQuery = useMemo(() => {
    const baseQuery = {
      ...getTaskQuery,
      filter: getTaskQuery.filter ? [...getTaskQuery.filter] : [],
    };

    return applyScopedFilter(baseQuery, scopedUserIds, {
      field: "responsibleId",
      operator: "in",
    });
  }, [scopedUserIds]);

  const enabled = scopedQuery !== null;

  return useQuery({
    queryKey: ["tasks", scopedQuery ?? "no-access"],
    queryFn: async () => {
      if (!scopedQuery) {
        return { data: [], count: 0 };
      }
      return taskService.get(scopedQuery);
    },
    enabled,
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
