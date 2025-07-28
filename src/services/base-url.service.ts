import { companyService } from './company.service';

export abstract class BaseCompanyService {
  protected companyId: string = '';

  protected getUrlBase(path: string): string {
    if (!this.companyId) {
      this.companyId = companyService.getDefaultCompany()?.id || '';
    }

    return `/companies/${this.companyId}/${path}`;
  }
}
