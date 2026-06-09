import { api } from '@/config/api';
import { BaseCompanyService } from '@/services/base-url.service';
import { BaseResponseCount } from '@/types/base-response-count';
import { Query } from 'nestjs-prisma-querybuilder-interface';
import {
  Contract,
  CreateContractDto,
  GenerateContractRecurringDto,
  SignedAttachmentDto,
} from '../types/contract';

export const getContractQuery: Query = {
  select: 'all',
  populate: [
    { path: 'client', select: 'id name cnpj address' },
    {
      path: 'type',
      select: 'id name lastAdjustmentPercentage lastAdjustmentAt',
    },
    { path: 'createdBy', select: 'id name' },
  ],
  sort: { field: 'createdAt', criteria: 'desc' },
  limit: 30,
};

class ContractService extends BaseCompanyService {
  private path = 'contracts';

  async get(params: Query = getContractQuery) {
    const { data } = await api.get<BaseResponseCount<Contract>>(
      this.getUrlBase(this.path),
      { params },
    );
    return data;
  }

  async getById(id: string): Promise<Contract> {
    const { data } = await api.get<Contract>(
      `${this.getUrlBase(this.path)}/${id}`,
    );
    return data;
  }

  async create(payload: CreateContractDto): Promise<Contract> {
    const { data } = await api.post<Contract>(
      this.getUrlBase(this.path),
      payload,
    );
    return data;
  }

  async update(
    id: string,
    payload: Partial<CreateContractDto>,
  ): Promise<Contract> {
    const { data } = await api.put<Contract>(
      `${this.getUrlBase(this.path)}/${id}`,
      payload,
    );
    return data;
  }

  async delete(id: string): Promise<Contract> {
    const { data } = await api.delete<Contract>(
      `${this.getUrlBase(this.path)}/${id}`,
    );
    return data;
  }

  async updateSignedAttachment(
    id: string,
    payload: SignedAttachmentDto,
  ): Promise<Contract> {
    const { data } = await api.put<Contract>(
      `${this.getUrlBase(this.path)}/${id}/signed-attachment`,
      payload,
    );
    return data;
  }

  async inactivate(id: string): Promise<Contract> {
    const { data } = await api.put<Contract>(
      `${this.getUrlBase(this.path)}/${id}/inactivate`,
    );
    return data;
  }

  async activate(id: string): Promise<Contract> {
    const { data } = await api.put<Contract>(
      `${this.getUrlBase(this.path)}/${id}/activate`,
    );
    return data;
  }

  async generateRecurring(
    id: string,
    payload: GenerateContractRecurringDto,
  ): Promise<Contract> {
    const { data } = await api.post<Contract>(
      `${this.getUrlBase(this.path)}/${id}/generate-recurring`,
      payload,
    );
    return data;
  }
}

export const contractService = new ContractService();
