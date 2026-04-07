import { Task } from '@/features/task/types';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { attendanceService } from '../../services/attendance.service';

export function useAttendanceTaskDetailQuery(
  companyId: string,
  taskId: string,
) {
  const { replace } = useRouter();

  const query = useQuery<Task>({
    queryKey: ['attendance-task-detail', companyId, taskId],
    queryFn: () => attendanceService.getById(companyId, taskId),
    enabled: !!companyId && !!taskId,
    staleTime: 30_000,
  });

  useEffect(() => {
    if (query.error) {
      replace('/panel/attendance');
    }
  }, [query.error, replace]);

  return query;
}
