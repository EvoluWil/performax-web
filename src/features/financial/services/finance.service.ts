import { api } from '@/config/api';
import { BaseCompanyService } from '@/services/base-url.service';
import { BaseResponseCount } from '@/types/base-response-count';
import { Query } from 'nestjs-prisma-querybuilder-interface';
import { CreateFinanceDto, CreateTransferDto, Finance } from '../types/finance';

export const getFinanceQuery: Query = {
  select: 'all',
  populate: [
    { path: 'type', select: 'id name' },
    { path: 'client', select: 'id name' },
    { path: 'method', select: 'id name' },
    { path: 'bank', select: 'id name' },
    { path: 'category', select: 'id name' },
    { path: 'payee', select: 'id name' },
    { path: 'createdBy', select: 'id name' },
  ],
  sort: { field: 'createdAt', criteria: 'desc' },
  limit: 30,
};

export const getFinanceDetailQuery: Query = {
  select: 'all',
  populate: [
    { path: 'type', select: 'id name' },
    { path: 'client', select: 'id name' },
    { path: 'method', select: 'id name' },
    { path: 'bank', select: 'id name code' },
    { path: 'category', select: 'id name' },
    { path: 'payee', select: 'id name' },
    { path: 'createdBy', select: 'id name' },
    { path: 'responsible', select: 'id name' },
    { path: 'employee', select: 'id name' },
  ],
};

class FinanceService extends BaseCompanyService {
  private path = 'finance';

  async get(params: Query = getFinanceQuery) {
    const { data } = await api.get<BaseResponseCount<Finance>>(
      this.getUrlBase(this.path),
      { params },
    );
    return data;
  }

  async getById(id: string): Promise<Finance> {
    const { data } = await api.get<Finance>(
      `${this.getUrlBase(this.path)}/${id}`,
      { params: getFinanceDetailQuery },
    );
    return data;
  }

  async create(payload: CreateFinanceDto): Promise<Finance> {
    const { data } = await api.post<Finance>(
      this.getUrlBase(this.path),
      payload,
    );
    return data;
  }

  async update(
    id: string,
    payload: Partial<CreateFinanceDto>,
  ): Promise<Finance> {
    const { data } = await api.put<Finance>(
      `${this.getUrlBase(this.path)}/${id}`,
      payload,
    );
    return data;
  }

  async delete(id: string): Promise<Finance> {
    const { data } = await api.delete<Finance>(
      `${this.getUrlBase(this.path)}/${id}`,
    );
    return data;
  }

  async approve(id: string, approved: boolean): Promise<Finance> {
    const { data } = await api.put<Finance>(
      `${this.getUrlBase(this.path)}/${id}/approve`,
      { approved },
    );
    return data;
  }

  async revertPayment(id: string): Promise<Finance> {
    const { data } = await api.put<Finance>(
      `${this.getUrlBase(this.path)}/${id}/revert-payment`,
    );
    return data;
  }

  async transfer(payload: CreateTransferDto): Promise<Finance[]> {
    const { data } = await api.post<Finance[]>(
      `${this.getUrlBase(this.path)}/transfer`,
      payload,
    );
    return data;
  }
}

export const financeService = new FinanceService();
