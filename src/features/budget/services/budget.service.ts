import { api } from '@/config/api';
import { BaseCompanyService } from '@/services/base-url.service';
import { BaseResponseCount } from '@/types/base-response-count';
import { Query } from 'nestjs-prisma-querybuilder-interface';
import { Budget, CreateBudgetDto } from '../types/budget';

export const getBudgetQuery: Query = {
  select: 'all',
  populate: [
    { path: 'client', select: 'id name' },
    { path: 'responsible', select: 'id name' },
    { path: 'createdBy', select: 'id name' },
    { path: 'type', select: 'id name' },
  ],
  filter: [
    { path: 'status', operator: 'not', value: 'COMPLETED', filterGroup: 'and' },
    { path: 'status', operator: 'not', value: 'REJECTED', filterGroup: 'and' },
  ],
  sort: { field: 'createdAt', criteria: 'desc' },
  limit: 30,
};

class BudgetService extends BaseCompanyService {
  private path = 'budgets';

  async get(params: Query = getBudgetQuery) {
    const { data } = await api.get<BaseResponseCount<Budget>>(
      this.getUrlBase(this.path),
      { params },
    );
    return data;
  }

  async getById(id: string): Promise<Budget> {
    const { data } = await api.get<Budget>(
      `${this.getUrlBase(this.path)}/${id}`,
    );
    return data;
  }

  async create(payload: CreateBudgetDto): Promise<Budget> {
    const { data } = await api.post<Budget>(
      this.getUrlBase(this.path),
      payload,
    );
    return data;
  }

  async update(id: string, payload: Partial<CreateBudgetDto>): Promise<Budget> {
    const { data } = await api.put<Budget>(
      `${this.getUrlBase(this.path)}/${id}`,
      payload,
    );
    return data;
  }

  async delete(id: string): Promise<Budget> {
    const { data } = await api.delete<Budget>(
      `${this.getUrlBase(this.path)}/${id}`,
    );
    return data;
  }

  async approve(id: string, approved: boolean): Promise<Budget> {
    const { data } = await api.put<Budget>(
      `${this.getUrlBase(this.path)}/${id}/approve`,
      { approved },
    );
    return data;
  }
}

export const budgetService = new BudgetService();
