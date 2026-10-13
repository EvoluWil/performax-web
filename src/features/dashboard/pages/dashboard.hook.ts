'use client';

import { dashboardService } from '@/features/dashboard/services/dashboard.service';
import { useCompanyModules } from '@/hooks/common/module';
import { useCompanyPermissions } from '@/hooks/common/permission';
import { companyService } from '@/services/company.service';
import { useQuery } from '@tanstack/react-query';

export function useDashboard(month: string) {
  const { hasPageAccess, isReady } = useCompanyPermissions();
  const { hasModule, isLoading: modulesLoading } = useCompanyModules();
  const companyId = companyService.getDefaultCompany()?.id ?? '';
  const allowed =
    isReady && !modulesLoading && hasModule('dashboard') && hasPageAccess('dashboard');

  const query = useQuery({
    queryKey: ['dashboard', companyId, month],
    enabled: allowed && Boolean(companyId),
    queryFn: () => dashboardService.get(month),
  });

  return {
    ...query,
    allowed,
    checkingAccess: !isReady || modulesLoading,
    companyId,
  };
}
