import { api } from '@/config/api';
import { BaseCompanyService } from '@/services/base-url.service';
import {
  CreateFinanceCategoryDto,
  FinanceCategory,
} from '../types/finance-category';

class FinanceCategoryService extends BaseCompanyService {
  private path = 'finance-categories';

  async getAll(): Promise<FinanceCategory[]> {
    const { data } = await api.get<FinanceCategory[]>(
      this.getUrlBase(this.path),
    );
    return data;
  }

  async create(payload: CreateFinanceCategoryDto): Promise<FinanceCategory> {
    const { data } = await api.post<FinanceCategory>(
      this.getUrlBase(this.path),
      payload,
    );
    return data;
  }

  async update(
    id: string,
    payload: Partial<CreateFinanceCategoryDto>,
  ): Promise<FinanceCategory> {
    const { data } = await api.put<FinanceCategory>(
      `${this.getUrlBase(this.path)}/${id}`,
      payload,
    );
    return data;
  }

  async delete(id: string): Promise<FinanceCategory> {
    const { data } = await api.delete<FinanceCategory>(
      `${this.getUrlBase(this.path)}/${id}`,
    );
    return data;
  }
}

export const financeCategoryService = new FinanceCategoryService();
