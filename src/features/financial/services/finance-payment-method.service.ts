import { api } from '@/config/api';
import { BaseCompanyService } from '@/services/base-url.service';
import {
  CreateFinancePaymentMethodDto,
  FinancePaymentMethod,
} from '../types/finance-payment-method';

class FinancePaymentMethodService extends BaseCompanyService {
  private path = 'finance-payment-methods';

  async getAll(): Promise<FinancePaymentMethod[]> {
    const { data } = await api.get<FinancePaymentMethod[]>(
      this.getUrlBase(this.path),
    );
    return data;
  }

  async create(
    payload: CreateFinancePaymentMethodDto,
  ): Promise<FinancePaymentMethod> {
    const { data } = await api.post<FinancePaymentMethod>(
      this.getUrlBase(this.path),
      payload,
    );
    return data;
  }

  async update(
    id: string,
    payload: Partial<CreateFinancePaymentMethodDto>,
  ): Promise<FinancePaymentMethod> {
    const { data } = await api.put<FinancePaymentMethod>(
      `${this.getUrlBase(this.path)}/${id}`,
      payload,
    );
    return data;
  }

  async delete(id: string): Promise<FinancePaymentMethod> {
    const { data } = await api.delete<FinancePaymentMethod>(
      `${this.getUrlBase(this.path)}/${id}`,
    );
    return data;
  }
}

export const financePaymentMethodService = new FinancePaymentMethodService();
