import { api } from '@/config/api';
import { BaseCompanyService } from '@/services/base-url.service';
import { companyService } from '@/services/company.service';
import { Company, CompanyModule, CompanyWhiteLabel } from '@/types/company';
import { Module } from '@/types/module';

export type UpdateCompanySettingsDto = {
  name?: string;
  groupId?: string | null;
};

export type UpsertWhiteLabelDto = {
  name?: string;
  logo?: string;
  banner?: string;
  favicon?: string;
  primaryColor?: string;
  secondaryColor?: string;
};

export type CreateCompanyDto = {
  name: string;
  groupId?: string;
};

class CustomizationService extends BaseCompanyService {
  async getWhiteLabel(): Promise<CompanyWhiteLabel | null> {
    const { data } = await api.get<CompanyWhiteLabel | null>(
      this.getUrlBase('white-label'),
    );
    return data;
  }

  async upsertWhiteLabel(dto: UpsertWhiteLabelDto): Promise<CompanyWhiteLabel> {
    const { data } = await api.put<CompanyWhiteLabel>(
      this.getUrlBase('white-label'),
      dto,
    );
    return data;
  }

  async deleteWhiteLabel(): Promise<void> {
    await api.delete(this.getUrlBase('white-label'));
  }

  async updateCompany(dto: UpdateCompanySettingsDto) {
    const companyId = companyService.getDefaultCompany()?.id;
    const { data } = await api.put(`/companies/${companyId}`, dto);
    return data;
  }

  async getOwnedCompanies(): Promise<Company[]> {
    const { data } = await api.get<Company[]>('/companies/owned');
    return data;
  }

  async createCompany(dto: CreateCompanyDto): Promise<Company> {
    const { data } = await api.post<Company>('/companies', dto);
    return data;
  }

  async linkCompany(
    companyId: string,
    targetCompanyId: string,
  ): Promise<Company> {
    const { data } = await api.post<Company>(`/companies/${companyId}/link`, {
      targetCompanyId,
    });
    return data;
  }

  async unlinkCompany(
    companyId: string,
    targetCompanyId: string,
  ): Promise<Company> {
    const { data } = await api.delete<Company>(
      `/companies/${companyId}/link/${targetCompanyId}`,
    );
    return data;
  }

  async getAllModules(): Promise<Module[]> {
    const { data } = await api.get<Module[]>('/modules');
    return data;
  }

  async getCompanyModules(): Promise<CompanyModule[]> {
    const companyId = companyService.getDefaultCompany()?.id;
    const { data } = await api.get<CompanyModule[]>(
      `/companies/${companyId}/modules`,
    );
    return data;
  }

  async enableModule(moduleId: string): Promise<CompanyModule> {
    const companyId = companyService.getDefaultCompany()?.id;
    const { data } = await api.post<CompanyModule>(
      `/companies/${companyId}/modules/${moduleId}`,
    );
    return data;
  }

  async disableModule(moduleId: string): Promise<void> {
    const companyId = companyService.getDefaultCompany()?.id;
    await api.delete(`/companies/${companyId}/modules/${moduleId}`);
  }
}

export const customizationService = new CustomizationService();
