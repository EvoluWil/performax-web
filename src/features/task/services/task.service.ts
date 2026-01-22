import { api } from '@/config/api';
import { TaskFormDto } from '@/features/task/schemas';
import { Task } from '@/features/task/types';
import { BaseCompanyService } from '@/services/base-url.service';
import { BaseResponseCount } from '@/types/base-response-count';
import { Query } from 'nestjs-prisma-querybuilder-interface';

export const getTaskQuery: Query = {
  select:
    'title description status value date files internalNote createdAt protocol completedAt recurrenceMasterId recurrence',
  populate: [
    {
      path: 'client',
      select: 'id name',
    },
    {
      path: 'type',
      select: 'id name',
    },
    {
      path: 'responsible',
      select: 'id name',
    },
    {
      path: 'checklist',
      select: 'id modules',
    },
  ],
  filter: [
    { path: 'status', operator: 'not', value: 'CLOSED', filterGroup: 'and' },
    { path: 'status', operator: 'not', value: 'REJECTED', filterGroup: 'and' },
  ],
  sort: {
    field: 'date',
    criteria: 'asc',
  },
  limit: 30,
};

class TaskService extends BaseCompanyService {
  private path = 'tasks';

  async get(params: Query = getTaskQuery) {
    const { data } = await api.get<BaseResponseCount<Task>>(
      this.getUrlBase(this.path),
      { params },
    );

    return data;
  }

  async getById(taskId: string): Promise<Task> {
    const { data } = await api.get<Task>(
      `${this.getUrlBase(this.path)}/${taskId}`,
    );
    return data;
  }

  async create(task: TaskFormDto): Promise<Task> {
    const { data } = await api.post<Task>(this.getUrlBase(this.path), task);
    return data;
  }

  async update(taskId: string, task: Partial<TaskFormDto>): Promise<Task> {
    const { data } = await api.put<Task>(
      `${this.getUrlBase(this.path)}/${taskId}`,
      task,
    );
    return data;
  }

  async delete(taskId: string): Promise<Task> {
    const { data } = await api.delete<Task>(
      `${this.getUrlBase(this.path)}/${taskId}`,
    );
    return data;
  }
}

export const taskService = new TaskService();
