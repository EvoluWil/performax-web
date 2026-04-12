import { api } from '@/config/api';
import { Company } from '@/types/company';
import { getCookie, setCookie } from 'cookies-next';

const DEFAULT_COMPANY_COOKIE_NAME = '@performax:default-company';

type CompanyGroupMember = { id: string; name: string };
type CompanyGroupResult = {
  id: string;
  name: string;
  description?: string;
  companies: CompanyGroupMember[];
} | null;

class CompanyService {
  setDefaultCompany(company: Company) {
    setCookie(DEFAULT_COMPANY_COOKIE_NAME, JSON.stringify(company), {});
  }

  getDefaultCompany(): Company | null {
    const company = getCookie(DEFAULT_COMPANY_COOKIE_NAME) as string;
    return company ? JSON.parse(company) : null;
  }

  async getGroup(companyId: string): Promise<CompanyGroupResult> {
    const { data } = await api.get<CompanyGroupResult>(
      `/companies/${companyId}/group`,
    );
    return data;
  }
}

export const companyService = new CompanyService();
