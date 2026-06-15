import { companyService } from './company.service';

export abstract class BaseCompanyService {
  protected getUrlBase(path: string, companyId?: string): string {
    const id = companyId || companyService.getDefaultCompany()?.id;

    if (!id || !/^[a-f\d]{24}$/i.test(id)) {
      throw new Error('Empresa não selecionada');
    }

    return `/companies/${id}/${path}`;
  }
}
