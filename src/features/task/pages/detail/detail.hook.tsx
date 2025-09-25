import { taskService } from '@/features/task/services/task.service';
import { Task } from '@/features/task/types';
import { useEffect, useState } from 'react';

export const useTaskDetail = (taskId: string) => {
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        setLoading(true);
        const data = await taskService.getById(taskId);
        if (mounted) setTask(data);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    if (taskId) load();

    return () => {
      mounted = false;
    };
  }, [taskId]);

  return { task, loading };
};
