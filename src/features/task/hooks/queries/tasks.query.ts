import { TaskFormDto } from '@/features/task/schemas';
import { taskService } from '@/features/task/services';
import { getTaskQuery } from '@/features/task/services/task.service';
import { Task } from '@/features/task/types';
import { useCompanyPermissions } from '@/hooks/common/permission';
import { applyScopedFilter } from '@/utils/query';
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { useMemo } from 'react';

type TaskMutationInput = {
  type: 'create' | 'update' | 'delete';
  id?: string;
  data?: Partial<TaskFormDto>;
};

type TasksQueryOptions = {
  pageSize?: number;
};

export function useTasksQuery(options: TasksQueryOptions = {}) {
  const { pageSize = getTaskQuery.limit ?? 30 } = options;
  const { getScopedUserIds, userId } = useCompanyPermissions();

  const scopedUserIds = useMemo(
    () => getScopedUserIds('task'),
    [getScopedUserIds],
  );

  const baseScopedQuery = useMemo(() => {
    const baseQuery = {
      ...getTaskQuery,
      filter: getTaskQuery.filter ? [...getTaskQuery.filter] : [],
      limit: pageSize,
    };

    return applyScopedFilter(baseQuery, scopedUserIds, userId, {
      field: 'responsibleId',
      operator: 'in',
    });
  }, [scopedUserIds, userId, pageSize]);

  const enabled = baseScopedQuery !== null;

  const query = useInfiniteQuery({
    queryKey: ['tasks', baseScopedQuery ?? 'no-access'],
    queryFn: async ({ pageParam = 1 }) => {
      if (!baseScopedQuery) {
        return { data: [], count: 0 };
      }
      return taskService.get({ ...baseScopedQuery, page: pageParam });
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, pages) => {
      const fetched = pages.length * pageSize;
      return fetched < lastPage.count ? pages.length + 1 : undefined;
    },
    enabled,
    refetchOnWindowFocus: false,
    select: (data) => {
      const tasks = data.pages.flatMap((p) => p.data);
      const total = data.pages[0]?.count ?? 0;
      return { ...data, tasks, count: total };
    },
  });

  return query;
}

export const useTaskMutation = (taskId?: string) => {
  const queryClient = useQueryClient();

  const mutationFn = async (input: TaskMutationInput): Promise<Task> => {
    switch (input.type) {
      case 'create':
        return taskService.create(input?.data as TaskFormDto);
      case 'update':
        return taskService.update(
          input?.id as string,
          input?.data as Partial<TaskFormDto>,
        );
      case 'delete':
        return taskService.delete(input?.id as string);
    }
  };

  const queryKey = ['tasks', 'task-detail'];

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

export const useTaskApprovalMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<Task, Error, { id: string; approved: boolean }>({
    mutationFn: ({ id, approved }) => taskService.approve(id, approved),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
};
