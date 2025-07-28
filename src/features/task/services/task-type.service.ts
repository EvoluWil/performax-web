import { api } from '@/config/api';
import { TaskTypeFormDto } from '@/features/task/schemas';
import { TaskType } from '@/features/task/types';
import { BaseCompanyService } from '@/services/base-url.service';

class TaskTypeService extends BaseCompanyService {
  private path = 'task-types';

  async get() {
    const { data } = await api.get<TaskType[]>(this.getUrlBase(this.path));

    return data;
  }

  async getById(taskTypeId: string): Promise<TaskType> {
    const { data } = await api.get<TaskType>(
      `${this.getUrlBase(this.path)}/${taskTypeId}`,
    );
    return data;
  }

  async create(taskType: TaskTypeFormDto): Promise<TaskType> {
    const { data } = await api.post<TaskType>(
      this.getUrlBase(this.path),
      taskType,
    );
    return data;
  }

  async update(
    taskTypeId: string,
    taskType: TaskTypeFormDto,
  ): Promise<TaskType> {
    const { data } = await api.put<TaskType>(
      `${this.getUrlBase(this.path)}/${taskTypeId}`,
      taskType,
    );
    return data;
  }

  async delete(taskTypeId: string): Promise<TaskType> {
    const { data } = await api.delete<TaskType>(
      `${this.getUrlBase(this.path)}/${taskTypeId}`,
    );
    return data;
  }
}

export const taskTypeService = new TaskTypeService();
