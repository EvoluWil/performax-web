import { api } from '@/config/api';
import { BaseCompanyService } from '@/services/base-url.service';
import {
  CreateFinanceSegmentDto,
  FinanceSegment,
} from '../types/finance-segment';

class FinanceSegmentService extends BaseCompanyService {
  private path = 'finance-segments';

  async getAll(): Promise<FinanceSegment[]> {
    const { data } = await api.get<FinanceSegment[]>(
      this.getUrlBase(this.path),
    );
    return data;
  }

  async create(payload: CreateFinanceSegmentDto): Promise<FinanceSegment> {
    const { data } = await api.post<FinanceSegment>(
      this.getUrlBase(this.path),
      payload,
    );
    return data;
  }

  async update(
    id: string,
    payload: Partial<CreateFinanceSegmentDto>,
  ): Promise<FinanceSegment> {
    const { data } = await api.put<FinanceSegment>(
      `${this.getUrlBase(this.path)}/${id}`,
      payload,
    );
    return data;
  }

  async delete(id: string): Promise<FinanceSegment> {
    const { data } = await api.delete<FinanceSegment>(
      `${this.getUrlBase(this.path)}/${id}`,
    );
    return data;
  }
}

export const financeSegmentService = new FinanceSegmentService();
