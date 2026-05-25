import { EmployeeList } from '@/features/employee/pages';
import { employeeService } from '@/features/employee/services';
import { QueryClient } from '@tanstack/react-query';

export default async function EmployeesPage() {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ['employees'],
    queryFn: () => employeeService.get(),
  });

  return <EmployeeList />;
}
