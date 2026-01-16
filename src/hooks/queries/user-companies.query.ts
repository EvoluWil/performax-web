import { authService } from '@/features/auth/services/auth.service';
import { useQuery } from '@tanstack/react-query';

export function useUserCompaniesQuery() {
  return useQuery({
    queryKey: ['users-companies'],
    queryFn: async () => {
      const user = await authService.getMe();
      const employeeCompanies =
        user.companyUser
          ?.map((item) => item.company)
          ?.filter((company) => company.ownerId !== user.id) || [];
      const companies = user.companies || [];
      return [...employeeCompanies, ...companies];
    },
    initialData: [],
  });
}
