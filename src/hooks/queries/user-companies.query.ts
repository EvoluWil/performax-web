import { authService } from "@/features/auth/services/auth.service";
import { useQuery } from "@tanstack/react-query";

export function useUserCompaniesQuery() {
  return useQuery({
    queryKey: ["users-companies"],
    queryFn: async () => {
      const user = await authService.getMe();
      const userCompanies = user.companyUser?.reduce(
        (acc, companyUser) => {
          return [...acc, companyUser.company];
        },
        [...user.companies]
      );
      return userCompanies;
    },
    initialData: [],
  });
}
