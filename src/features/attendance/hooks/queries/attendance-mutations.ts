import { TaskFormDto } from '@/features/task/schemas';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { attendanceService } from '../../services/attendance.service';

export function useAttendanceMutation(companyId: string, taskId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<TaskFormDto>) =>
      attendanceService.update(companyId, taskId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['attendance-task-detail', companyId, taskId],
      });
      queryClient.invalidateQueries({ queryKey: ['attendance-tasks'] });
    },
  });
}
