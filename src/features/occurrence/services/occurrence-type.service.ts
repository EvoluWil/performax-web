import { api } from '@/config/api';
import { BaseCompanyService } from '@/services/base-url.service';
import { OccurrenceTypeFormDto } from '../schemas';
import { OccurrenceType } from '../types';

class OccurrenceTypeService extends BaseCompanyService {
  private path = 'occurrence-types';

  async get() {
    const { data } = await api.get<OccurrenceType[]>(
      this.getUrlBase(this.path),
    );
    return data;
  }

  async getById(id: string): Promise<OccurrenceType> {
    const { data } = await api.get<OccurrenceType>(
      `${this.getUrlBase(this.path)}/${id}`,
    );
    return data;
  }

  async create(payload: OccurrenceTypeFormDto): Promise<OccurrenceType> {
    const { data } = await api.post<OccurrenceType>(
      this.getUrlBase(this.path),
      payload,
    );
    return data;
  }

  async update(
    id: string,
    payload: OccurrenceTypeFormDto,
  ): Promise<OccurrenceType> {
    const { data } = await api.put<OccurrenceType>(
      `${this.getUrlBase(this.path)}/${id}`,
      payload,
    );
    return data;
  }

  async delete(id: string): Promise<OccurrenceType> {
    const { data } = await api.delete<OccurrenceType>(
      `${this.getUrlBase(this.path)}/${id}`,
    );
    return data;
  }
}

export const occurrenceTypeService = new OccurrenceTypeService();
