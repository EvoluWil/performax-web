import { Permission } from '@/features/role/types/permission';
import { useMemo } from 'react';
import { useCompanyPermissions } from './permission';

export function canSeeClosedTaskFilter(
  hasPermission: (permissionKey: string, scope?: 'filter' | 'read' | 'write' | 'admin') => boolean,
  getModuleScope: (moduleKey: string) => Permission['scope'] | null,
  isReady: boolean,
): boolean {
  if (!isReady) {
    return false;
  }

  if (!hasPermission('task', 'write')) {
    return false;
  }

  const scope = getModuleScope('task');
  return scope === 'TEAM' || scope === 'ALL';
}

export function useClosedTaskFilterAccess() {
  const { hasPermission, getModuleScope, isReady } = useCompanyPermissions();

  return useMemo(
    () => canSeeClosedTaskFilter(hasPermission, getModuleScope, isReady),
    [getModuleScope, hasPermission, isReady],
  );
}
