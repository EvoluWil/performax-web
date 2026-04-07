import { api } from '@/config/api';
import {
  CompanyGroup,
  CompanyGroupMember,
  CreateCompanyGroupDto,
} from '../types/company-group';

class CompanyGroupService {
  private basePath = '/company-groups';

  async getAll(): Promise<CompanyGroup[]> {
    const { data } = await api.get<CompanyGroup[]>(this.basePath);
    return data;
  }

  async getById(id: string): Promise<CompanyGroup> {
    const { data } = await api.get<CompanyGroup>(`${this.basePath}/${id}`);
    return data;
  }

  async getCompanies(groupId: string): Promise<CompanyGroupMember[]> {
    const { data } = await api.get<CompanyGroupMember[]>(
      `${this.basePath}/${groupId}/companies`,
    );
    return data;
  }

  async create(payload: CreateCompanyGroupDto): Promise<CompanyGroup> {
    const { data } = await api.post<CompanyGroup>(this.basePath, payload);
    return data;
  }

  async update(
    id: string,
    payload: Partial<CreateCompanyGroupDto>,
  ): Promise<CompanyGroup> {
    const { data } = await api.put<CompanyGroup>(
      `${this.basePath}/${id}`,
      payload,
    );
    return data;
  }

  async delete(id: string): Promise<CompanyGroup> {
    const { data } = await api.delete<CompanyGroup>(`${this.basePath}/${id}`);
    return data;
  }

  async assignCompanyToGroup(
    companyId: string,
    groupId: string | null,
  ): Promise<void> {
    await api.patch(`${this.basePath}/companies/${companyId}/group`, {
      groupId,
    });
  }
}

export const companyGroupService = new CompanyGroupService();
