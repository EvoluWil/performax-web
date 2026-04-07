import { api } from '@/config/api';
import { BaseCompanyService } from '@/services/base-url.service';
import { CreateFinancePayeeDto, FinancePayee } from '../types/finance-payee';

class FinancePayeeService extends BaseCompanyService {
  private path = 'finance-payees';

  async getAll(): Promise<FinancePayee[]> {
    const { data } = await api.get<FinancePayee[]>(this.getUrlBase(this.path));
    return data;
  }

  async create(payload: CreateFinancePayeeDto): Promise<FinancePayee> {
    const { data } = await api.post<FinancePayee>(
      this.getUrlBase(this.path),
      payload,
    );
    return data;
  }

  async update(
    id: string,
    payload: Partial<CreateFinancePayeeDto>,
  ): Promise<FinancePayee> {
    const { data } = await api.put<FinancePayee>(
      `${this.getUrlBase(this.path)}/${id}`,
      payload,
    );
    return data;
  }

  async delete(id: string): Promise<FinancePayee> {
    const { data } = await api.delete<FinancePayee>(
      `${this.getUrlBase(this.path)}/${id}`,
    );
    return data;
  }
}

export const financePayeeService = new FinancePayeeService();
