import { api } from '@/config/api';
import { UserFormDto } from '@/features/user/schemas';
import { BaseCompanyService } from '@/services/base-url.service';
import { BaseResponseCount } from '@/types/base-response-count';
import { User } from '@/types/user';
import { Query } from 'nestjs-prisma-querybuilder-interface';

export const getUserQuery: Query = {
  select: 'name email cpf role',
  populate: [
    {
      path: 'companyUser',
      select: 'role',
    },
  ],
  sort: {
    field: 'name',
    criteria: 'asc',
  },
  limit: 30,
};

class UserService extends BaseCompanyService {
  private path = 'users';

  async get(params: Query = getUserQuery) {
    const { data } = await api.get<BaseResponseCount<User>>(
      this.getUrlBase(this.path),
      { params },
    );

    return data;
  }

  async getById(userId: string): Promise<User> {
    const { data } = await api.get<User>(
      `${this.getUrlBase(this.path)}/${userId}`,
    );
    return data;
  }

  async create(user: UserFormDto): Promise<User> {
    const { data } = await api.post<User>(this.getUrlBase(this.path), user);
    return data;
  }

  async update(userId: string, user: UserFormDto): Promise<User> {
    const { data } = await api.put<User>(
      `${this.getUrlBase(this.path)}/${userId}`,
      user,
    );
    return data;
  }

  async delete(userId: string): Promise<User> {
    const { data } = await api.delete<User>(
      `${this.getUrlBase(this.path)}/${userId}`,
    );
    return data;
  }
}

export const userService = new UserService();
