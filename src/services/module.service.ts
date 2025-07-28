import { api } from '@/config/api';
import { CompanyModule } from '@/types/company';
import { companyService } from './company.service';

class CompanyModuleService {
  private companyId: string = '';

  private getUrlBase() {
    if (!this.companyId) {
      this.companyId = companyService.getDefaultCompany()?.id || '';
    }

    return `/companies/${this.companyId}/modules`;
  }

  async get() {
    const { data } = await api.get<CompanyModule[]>(this.getUrlBase());

    return data;
  }
}

export const companyModuleService = new CompanyModuleService();
