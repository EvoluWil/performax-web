import { useCompanyModulesQuery } from "@/hooks/queries/company-modules.query";
import { CompanyModule } from "@/types/company";
import { useCallback, useMemo } from "react";

export const useCompanyModules = () => {
  const { data, isLoading, isFetching, isRefetching, refetch } =
    useCompanyModulesQuery();

  const modules = useMemo<CompanyModule[]>(() => data || [], [data]);

  const hasModule = useCallback(
    (moduleKey: string) => {
      if (!moduleKey) {
        return false;
      }
      const normalized = moduleKey.trim().toLowerCase();

      return modules.some((item) => {
        const byCode = item.module?.code?.toLowerCase() === normalized;

        return byCode;
      });
    },
    [modules]
  );

  return {
    modules,
    hasModule,
    isLoading,
    isFetching,
    isRefetching,
    refetch,
  };
};
