import { companyModuleService } from "@/services/module.service";
import { useQuery } from "@tanstack/react-query";

export function useCompanyModulesQuery() {
  return useQuery({
    queryKey: ["company-modules"],
    queryFn: async () => {
      const modules = await companyModuleService.get();
      return modules;
    },
    initialData: [],
    refetchOnWindowFocus: false,
  });
}
