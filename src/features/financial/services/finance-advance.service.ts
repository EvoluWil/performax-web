import { api } from '@/config/api';
import { BaseCompanyService } from '@/services/base-url.service';
import {
  CreateAdvanceDto,
  FinanceAdvance,
  FinanceAdvanceAvailable,
} from '../types/finance-advance';

class FinanceAdvanceService extends BaseCompanyService {
  private path = 'finance-advance';

  async getAll(): Promise<FinanceAdvance[]> {
    const { data } = await api.get<FinanceAdvance[]>(
      this.getUrlBase(this.path),
    );
    return data;
  }

  async getAvailable(): Promise<FinanceAdvanceAvailable[]> {
    const { data } = await api.get<FinanceAdvanceAvailable[]>(
      `${this.getUrlBase(this.path)}/available`,
    );
    return data;
  }

  async getById(id: string): Promise<FinanceAdvance> {
    const { data } = await api.get<FinanceAdvance>(
      `${this.getUrlBase(this.path)}/${id}`,
    );
    return data;
  }

  async create(payload: CreateAdvanceDto): Promise<FinanceAdvance> {
    const { data } = await api.post<FinanceAdvance>(
      this.getUrlBase(this.path),
      payload,
    );
    return data;
  }

  async delete(id: string): Promise<void> {
    await api.delete(`${this.getUrlBase(this.path)}/${id}`);
  }
}

export const financeAdvanceService = new FinanceAdvanceService();
