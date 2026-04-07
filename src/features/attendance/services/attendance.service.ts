import { api } from '@/config/api';
import { TaskFormDto } from '@/features/task/schemas';
import { Task } from '@/features/task/types';
import { BaseResponseCount } from '@/types/base-response-count';
import { Query } from 'nestjs-prisma-querybuilder-interface';

export const attendanceTaskQuery: Query = {
  select:
    'title description status approved value date files conclusionFiles internalNote impedimentNote conclusionNote createdAt protocol completedAt recurrenceMasterId recurrence',
  populate: [
    { path: 'client', select: 'id name' },
    { path: 'type', select: 'id name' },
    { path: 'responsible', select: 'id name' },
    { path: 'checklist', select: 'id modules' },
  ],
  sort: { field: 'date', criteria: 'asc' },
  limit: 30,
};

class AttendanceService {
  private path = 'tasks';

  private url(companyId: string, suffix = '') {
    return `/companies/${companyId}/${this.path}${suffix}`;
  }

  async getTasks(
    companyId: string,
    params: Query = attendanceTaskQuery,
  ): Promise<BaseResponseCount<Task>> {
    const { data } = await api.get<BaseResponseCount<Task>>(
      this.url(companyId),
      { params },
    );
    return data;
  }

  async getById(companyId: string, taskId: string): Promise<Task> {
    const { data } = await api.get<Task>(this.url(companyId, `/${taskId}`));
    return data;
  }

  async update(
    companyId: string,
    taskId: string,
    body: Partial<TaskFormDto>,
  ): Promise<Task> {
    const { data } = await api.put<Task>(
      this.url(companyId, `/${taskId}`),
      body,
    );
    return data;
  }
}

export const attendanceService = new AttendanceService();
