import { companyService } from './company.service';

export abstract class BaseCompanyService {
  protected getUrlBase(path: string): string {
    const companyId = companyService.getDefaultCompany()?.id || '';
    return `/companies/${companyId}/${path}`;
  }
}
