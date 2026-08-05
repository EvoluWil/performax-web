import { FilterFieldConfig } from '@/constants/filter-permissions';
import { useCompanyPermissions } from '@/hooks/common/permission';
import { useMemo } from 'react';

export function useFilterFieldAccess(fields: FilterFieldConfig[]) {
  const { hasFilterAccess, isReady } = useCompanyPermissions();

  return useMemo(() => {
    const access: Record<string, boolean> = {};
    for (const { field, module } of fields) {
      access[field] = isReady && hasFilterAccess(module);
    }
    return access;
  }, [fields, hasFilterAccess, isReady]);
}
