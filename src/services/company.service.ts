import { Company } from "@/types/company";
import { getCookie, setCookie } from "cookies-next";

const DEFAULT_COMPANY_COOKIE_NAME = "@performax:default-company";

class CompanyService {
  setDefaultCompany(company: Company) {
    setCookie(DEFAULT_COMPANY_COOKIE_NAME, JSON.stringify(company), {});
  }
  getDefaultCompany(): Company | null {
    const company = getCookie(DEFAULT_COMPANY_COOKIE_NAME) as string;
    return company ? JSON.parse(company) : null;
  }
}

export const companyService = new CompanyService();
