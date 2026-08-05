import { api } from '@/config/api';
import { BaseCompanyService } from '@/services/base-url.service';
import { BaseResponseCount } from '@/types/base-response-count';
import { Query } from 'nestjs-prisma-querybuilder-interface';
import {
  buildOccurrenceStatusOrFilter,
  occurrenceFilterInitialValues,
} from '../schemas/occurrence-filter.schema';
import { CreateOccurrenceDto, Occurrence } from '../types';

export const getOccurrenceQuery: Query = {
  select: 'all',
  populate: [
    { path: 'client', select: 'id name' },
    { path: 'createdBy', select: 'id name' },
    { path: 'responsible', select: 'id name' },
    { path: 'type', select: 'id name' },
  ],
  filter: buildOccurrenceStatusOrFilter(occurrenceFilterInitialValues),
  sort: { field: 'createdAt', criteria: 'desc' },
  limit: 30,
};

class OccurrenceService extends BaseCompanyService {
  private path = 'occurrences';

  async get(params: Query = getOccurrenceQuery) {
    const { data } = await api.get<BaseResponseCount<Occurrence>>(
      this.getUrlBase(this.path),
      { params },
    );
    return data;
  }

  async getById(id: string): Promise<Occurrence> {
    const { data } = await api.get<Occurrence>(
      `${this.getUrlBase(this.path)}/${id}`,
    );
    return data;
  }

  async create(payload: CreateOccurrenceDto): Promise<Occurrence> {
    const { data } = await api.post<Occurrence>(
      this.getUrlBase(this.path),
      payload,
    );
    return data;
  }

  async update(
    id: string,
    payload: Partial<CreateOccurrenceDto>,
  ): Promise<Occurrence> {
    const { data } = await api.put<Occurrence>(
      `${this.getUrlBase(this.path)}/${id}`,
      payload,
    );
    return data;
  }

  async delete(id: string): Promise<Occurrence> {
    const { data } = await api.delete<Occurrence>(
      `${this.getUrlBase(this.path)}/${id}`,
    );
    return data;
  }

  async approve(id: string, approved: boolean): Promise<Occurrence> {
    const { data } = await api.put<Occurrence>(
      `${this.getUrlBase(this.path)}/${id}/approve`,
      { approved },
    );
    return data;
  }
}

export const occurrenceService = new OccurrenceService();
