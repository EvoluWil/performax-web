import { api } from '@/config/api';
import { BaseCompanyService } from '@/services/base-url.service';
import { CreateFinanceTypeDto, FinanceType } from '../types/finance-type';

class FinanceTypeService extends BaseCompanyService {
  private path = 'finance-types';

  async getAll(): Promise<FinanceType[]> {
    const { data } = await api.get<FinanceType[]>(this.getUrlBase(this.path));
    return data;
  }

  async create(payload: CreateFinanceTypeDto): Promise<FinanceType> {
    const { data } = await api.post<FinanceType>(
      this.getUrlBase(this.path),
      payload,
    );
    return data;
  }

  async update(
    id: string,
    payload: Partial<CreateFinanceTypeDto>,
  ): Promise<FinanceType> {
    const { data } = await api.put<FinanceType>(
      `${this.getUrlBase(this.path)}/${id}`,
      payload,
    );
    return data;
  }

  async delete(id: string): Promise<FinanceType> {
    const { data } = await api.delete<FinanceType>(
      `${this.getUrlBase(this.path)}/${id}`,
    );
    return data;
  }
}

export const financeTypeService = new FinanceTypeService();
