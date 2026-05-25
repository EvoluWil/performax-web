import { api } from '@/config/api';
import { EmployeeFormDto } from '@/features/employee/schemas';
import { Employee } from '@/features/employee/types';
import { BaseCompanyService } from '@/services/base-url.service';
import { BaseResponseCount } from '@/types/base-response-count';
import { Query } from 'nestjs-prisma-querybuilder-interface';

export const getEmployeeQuery: Query = {
  select: 'name cpf clientId',
  sort: {
    field: 'name',
    criteria: 'asc',
  },
  limit: 30,
};

class EmployeeService extends BaseCompanyService {
  private path = 'employees';

  async get(params: Query = getEmployeeQuery) {
    const { data } = await api.get<BaseResponseCount<Employee>>(
      this.getUrlBase(this.path),
      { params },
    );

    return data;
  }

  async getById(employeeId: string): Promise<Employee> {
    const { data } = await api.get<Employee>(
      `${this.getUrlBase(this.path)}/${employeeId}`,
    );
    return data;
  }

  async create(employee: EmployeeFormDto): Promise<Employee> {
    const { data } = await api.post<Employee>(
      this.getUrlBase(this.path),
      employee,
    );
    return data;
  }

  async update(
    employeeId: string,
    employee: EmployeeFormDto,
  ): Promise<Employee> {
    const { data } = await api.put<Employee>(
      `${this.getUrlBase(this.path)}/${employeeId}`,
      employee,
    );
    return data;
  }

  async delete(employeeId: string): Promise<Employee> {
    const { data } = await api.delete<Employee>(
      `${this.getUrlBase(this.path)}/${employeeId}`,
    );
    return data;
  }
}

export const employeeService = new EmployeeService();
