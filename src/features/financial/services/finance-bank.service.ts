import { api } from '@/config/api';
import { BaseCompanyService } from '@/services/base-url.service';
import { CreateFinanceBankDto, FinanceBank } from '../types/finance-bank';

class FinanceBankService extends BaseCompanyService {
  private path = 'finance-banks';

  async getAll(): Promise<FinanceBank[]> {
    const { data } = await api.get<FinanceBank[]>(this.getUrlBase(this.path));
    return data;
  }

  async create(payload: CreateFinanceBankDto): Promise<FinanceBank> {
    const { data } = await api.post<FinanceBank>(
      this.getUrlBase(this.path),
      payload,
    );
    return data;
  }

  async update(
    id: string,
    payload: Partial<CreateFinanceBankDto>,
  ): Promise<FinanceBank> {
    const { data } = await api.put<FinanceBank>(
      `${this.getUrlBase(this.path)}/${id}`,
      payload,
    );
    return data;
  }

  async delete(id: string): Promise<FinanceBank> {
    const { data } = await api.delete<FinanceBank>(
      `${this.getUrlBase(this.path)}/${id}`,
    );
    return data;
  }
}

export const financeBankService = new FinanceBankService();
