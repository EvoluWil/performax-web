import { api } from '@/config/api';
import { BaseCompanyService } from '@/services/base-url.service';
import { ContractTypeFormDto } from '../schemas/contract-type.schema';
import { ContractType } from '../types/contract-type';

class ContractTypeService extends BaseCompanyService {
  private path = 'contract-types';

  async get() {
    const { data } = await api.get<ContractType[]>(this.getUrlBase(this.path));
    return data;
  }

  async create(payload: ContractTypeFormDto): Promise<ContractType> {
    const { data } = await api.post<ContractType>(
      this.getUrlBase(this.path),
      payload,
    );
    return data;
  }

  async update(
    id: string,
    payload: ContractTypeFormDto,
  ): Promise<ContractType> {
    const { data } = await api.put<ContractType>(
      `${this.getUrlBase(this.path)}/${id}`,
      payload,
    );
    return data;
  }

  async delete(id: string): Promise<ContractType> {
    const { data } = await api.delete<ContractType>(
      `${this.getUrlBase(this.path)}/${id}`,
    );
    return data;
  }

  async applyAdjustment(
    id: string,
    percentage: number,
  ): Promise<ContractType> {
    const { data } = await api.post<ContractType>(
      `${this.getUrlBase(this.path)}/${id}/adjustments`,
      { percentage },
    );
    return data;
  }
}

export const contractTypeService = new ContractTypeService();
