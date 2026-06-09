import { api } from '@/config/api';
import { BaseCompanyService } from '@/services/base-url.service';
import {
  CreateReceivableDto,
  FinanceReceivable,
} from '../types/finance-receivable';

class FinanceReceivableService extends BaseCompanyService {
  private path = 'finance-receivable';

  async getAll(): Promise<FinanceReceivable[]> {
    const { data } = await api.get<FinanceReceivable[]>(
      this.getUrlBase(this.path),
    );
    return data;
  }

  async getById(id: string): Promise<FinanceReceivable> {
    const { data } = await api.get<FinanceReceivable>(
      `${this.getUrlBase(this.path)}/${id}`,
    );
    return data;
  }

  async create(payload: CreateReceivableDto): Promise<FinanceReceivable> {
    const { data } = await api.post<FinanceReceivable>(
      this.getUrlBase(this.path),
      payload,
    );
    return data;
  }

  async delete(id: string): Promise<void> {
    await api.delete(`${this.getUrlBase(this.path)}/${id}`);
  }
}

export const financeReceivableService = new FinanceReceivableService();
