import { companyService } from '@/services/company.service';
import { useQuery } from '@tanstack/react-query';

export function useCompanyGroupQuery(companyId?: string) {
  return useQuery({
    queryKey: ['company-group', companyId],
    queryFn: () => companyService.getGroup(companyId!),
    enabled: !!companyId,
    refetchOnWindowFocus: false,
  });
}
