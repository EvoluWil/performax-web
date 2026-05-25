import { EmployeeFormDto } from '@/features/employee/schemas';
import { employeeService } from '@/features/employee/services';
import { getEmployeeQuery } from '@/features/employee/services/employee.service';
import { Employee } from '@/features/employee/types';
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { useMemo } from 'react';

type EmployeeMutationInput = {
  type: 'create' | 'update' | 'delete';
  id?: string;
  data?: EmployeeFormDto;
};

type EmployeesQueryOptions = {
  scopeModule?: string;
  pageSize?: number;
};

export function useEmployeesQuery(options: EmployeesQueryOptions = {}) {
  const { scopeModule = 'employee', pageSize = getEmployeeQuery.limit ?? 30 } =
    options;

  const baseQuery = useMemo(() => {
    return {
      ...getEmployeeQuery,
      filter: getEmployeeQuery.filter ? [...getEmployeeQuery.filter] : [],
      limit: pageSize,
    };
  }, [pageSize]);

  const query = useInfiniteQuery({
    queryKey: ['employees', scopeModule, baseQuery],
    queryFn: async ({ pageParam = 1 }) => {
      return employeeService.get({
        ...baseQuery,
        page: pageParam,
      });
    },

    initialPageParam: 1,

    getNextPageParam: (lastPage, pages) => {
      const fetched = pages.length * pageSize;
      return fetched < lastPage.count ? pages.length + 1 : undefined;
    },

    refetchOnWindowFocus: false,

    select: (data) => {
      const employees = data.pages.flatMap((p) => p.data);
      const total = data.pages[0]?.count ?? 0;

      return {
        ...data,
        employees,
        count: total,
        loadedCount: employees.length,
      };
    },
  });

  return query;
}

export const useEmployeeMutation = () => {
  const queryClient = useQueryClient();

  const mutationFn = async (
    input: EmployeeMutationInput,
  ): Promise<Employee> => {
    switch (input.type) {
      case 'create':
        return employeeService.create(input.data as EmployeeFormDto);

      case 'update':
        return employeeService.update(
          input.id as string,
          input.data as EmployeeFormDto,
        );

      case 'delete':
        return employeeService.delete(input.id as string);
    }
  };

  return useMutation<Employee, Error, EmployeeMutationInput>({
    mutationFn,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['employees'],
      });
    },
  });
};
