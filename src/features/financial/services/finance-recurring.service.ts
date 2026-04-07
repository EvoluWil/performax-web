import { api } from '@/config/api';
import { BaseCompanyService } from '@/services/base-url.service';
import {
  CreateFinanceRecurringDto,
  FinanceRecurring,
} from '../types/finance-recurring';

class FinanceRecurringService extends BaseCompanyService {
  private path = 'finance-recurring';

  async getAll(): Promise<FinanceRecurring[]> {
    const { data } = await api.get<FinanceRecurring[]>(
      this.getUrlBase(this.path),
    );
    return data;
  }

  async getById(id: string): Promise<FinanceRecurring> {
    const { data } = await api.get<FinanceRecurring>(
      `${this.getUrlBase(this.path)}/${id}`,
    );
    return data;
  }

  async create(payload: CreateFinanceRecurringDto): Promise<FinanceRecurring> {
    const { data } = await api.post<FinanceRecurring>(
      this.getUrlBase(this.path),
      payload,
    );
    return data;
  }

  async update(
    id: string,
    payload: Partial<CreateFinanceRecurringDto>,
  ): Promise<FinanceRecurring> {
    const { data } = await api.put<FinanceRecurring>(
      `${this.getUrlBase(this.path)}/${id}`,
      payload,
    );
    return data;
  }

  async delete(id: string): Promise<FinanceRecurring> {
    const { data } = await api.delete<FinanceRecurring>(
      `${this.getUrlBase(this.path)}/${id}`,
    );
    return data;
  }

  async process(): Promise<void> {
    await api.post(`${this.getUrlBase(this.path)}/process`);
  }
}

export const financeRecurringService = new FinanceRecurringService();
