import { api } from "@/config/api";
import { BaseCompanyService } from "@/services/base-url.service";
import { User } from "@/types/user";
import { UserClientsFormDto, UserSubordinatesFormDto } from "../schemas";
import { UserRole } from "../types";

export type AssignUserRoleDto = {
  userId: string;
  roleId: string;
};

class UserRoleService extends BaseCompanyService {
  private path = "users";

  async getUserRole(userId: string): Promise<UserRole> {
    const { data } = await api.get<UserRole>(
      `${this.getUrlBase(this.path)}/${userId}/roles`
    );
    return data;
  }

  async assignRole(data: AssignUserRoleDto): Promise<User> {
    const { data: response } = await api.post<User>(
      `${this.getUrlBase(this.path)}/${data.userId}/roles`,
      { roleId: data.roleId }
    );
    return response;
  }

  async assignSubordinates(
    userId: string,
    data: UserSubordinatesFormDto
  ): Promise<User> {
    const { data: response } = await api.post<User>(
      `${this.getUrlBase(this.path)}/${userId}/roles/targets`,
      data
    );
    return response;
  }

  async assignClients(userId: string, data: UserClientsFormDto): Promise<User> {
    const { data: response } = await api.post<User>(
      `${this.getUrlBase(this.path)}/${userId}/roles/clients`,
      data
    );
    return response;
  }

  async removeRole(userId: string): Promise<User> {
    const { data } = await api.delete<User>(
      `${this.getUrlBase(this.path)}/${userId}/role`
    );
    return data;
  }
}

export const userRoleService = new UserRoleService();
