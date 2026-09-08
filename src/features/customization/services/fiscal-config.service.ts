import { api } from '@/config/api';
import { BaseCompanyService } from '@/services/base-url.service';
import {
  FiscalConfig,
  FiscalStatus,
  UpsertFiscalConfigDto,
} from '../types/fiscal-config';

class FiscalConfigService extends BaseCompanyService {
  async get(): Promise<FiscalConfig | null> {
    const { data } = await api.get<FiscalConfig | null>(
      this.getUrlBase('fiscal-config'),
    );
    return data;
  }

  async getStatus(): Promise<FiscalStatus> {
    const { data } = await api.get<FiscalStatus>(
      this.getUrlBase('fiscal-config/status'),
    );
    return data;
  }

  async upsert(dto: UpsertFiscalConfigDto): Promise<FiscalConfig> {
    const { data } = await api.put<FiscalConfig>(
      this.getUrlBase('fiscal-config'),
      dto,
    );
    return data;
  }

  async sync(dto: {
    certificateFileName?: string;
    certificateFileBase64?: string;
    certificatePassword?: string;
  }): Promise<FiscalConfig> {
    const { data } = await api.post<FiscalConfig>(
      this.getUrlBase('fiscal-config/sync'),
      dto,
    );
    return data;
  }

  async getCities(code?: string) {
    const { data } = await api.get(this.getUrlBase('fiscal-config/cities'), {
      params: code ? { code } : undefined,
    });
    return data;
  }
}

export const fiscalConfigService = new FiscalConfigService();
