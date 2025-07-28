import { api } from '@/config/api';
import { RoleFormDto } from '@/features/role/schemas';
import { Role } from '@/features/role/types';
import { BaseCompanyService } from '@/services/base-url.service';

class RoleService extends BaseCompanyService {
  private path = 'roles';

  async get() {
    const { data } = await api.get<Role[]>(this.getUrlBase(this.path));

    return data;
  }

  async getById(roleId: string): Promise<Role> {
    const { data } = await api.get<Role>(
      `${this.getUrlBase(this.path)}/${roleId}`,
    );
    return data;
  }

  async create(role: RoleFormDto): Promise<Role> {
    const { data } = await api.post<Role>(this.getUrlBase(this.path), role);
    return data;
  }

  async update(roleId: string, role: RoleFormDto): Promise<Role> {
    const { data } = await api.put<Role>(
      `${this.getUrlBase(this.path)}/${roleId}`,
      role,
    );
    return data;
  }

  async delete(roleId: string): Promise<Role> {
    const { data } = await api.delete<Role>(
      `${this.getUrlBase(this.path)}/${roleId}`,
    );
    return data;
  }
}

export const roleService = new RoleService();
