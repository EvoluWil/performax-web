import { api } from '@/config/api';
import { ClientFormDto } from '@/features/client/schemas';
import { Client, FiscalStatus } from '@/features/client/types';
import { BaseCompanyService } from '@/services/base-url.service';
import { BaseResponseCount } from '@/types/base-response-count';
import { Query } from 'nestjs-prisma-querybuilder-interface';

export const getClientQuery: Query = {
  select:
    'name address cnpj cpf email phone personType fiscalAddress',
  sort: {
    field: 'name',
    criteria: 'asc',
  },
  limit: 30,
};

class ClientService extends BaseCompanyService {
  private path = 'clients';

  async get(params: Query = getClientQuery) {
    const { data } = await api.get<BaseResponseCount<Client>>(
      this.getUrlBase(this.path),
      { params },
    );

    return data;
  }

  async getById(clientId: string): Promise<Client> {
    const { data } = await api.get<Client>(
      `${this.getUrlBase(this.path)}/${clientId}`,
    );
    return data;
  }

  async create(client: ClientFormDto): Promise<Client> {
    const { data } = await api.post<Client>(this.getUrlBase(this.path), client);
    return data;
  }

  async update(clientId: string, client: ClientFormDto): Promise<Client> {
    const { data } = await api.put<Client>(
      `${this.getUrlBase(this.path)}/${clientId}`,
      client,
    );
    return data;
  }

  async delete(clientId: string): Promise<Client> {
    const { data } = await api.delete<Client>(
      `${this.getUrlBase(this.path)}/${clientId}`,
    );
    return data;
  }

  async getFiscalStatus(clientId: string): Promise<FiscalStatus> {
    const { data } = await api.get<FiscalStatus>(
      `${this.getUrlBase(this.path)}/${clientId}/fiscal-status`,
    );
    return data;
  }
}

export const clientService = new ClientService();
