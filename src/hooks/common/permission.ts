import { Role } from "@/features/role/types";
import { Permission } from "@/features/role/types/permission";
import { useMeQuery } from "@/hooks/queries/me.query";
import { useSession } from "@/providers/auth";
import { companyService } from "@/services/company.service";
import { Company } from "@/types/company";
import { useCallback, useMemo } from "react";

type PermissionScope = "read" | "write" | "admin";

const scopeRank: Record<PermissionScope, number> = {
  read: 0,
  write: 1,
  admin: 2,
};

const permissionRank: Record<Permission["permission"], number> = {
  READ: 0,
  WRITE: 1,
  ADMIN: 2,
};

const moduleScopeRank: Record<Permission["scope"], number> = {
  SELF: 0,
  TEAM: 1,
  ALL: 2,
};

export const useCompanyPermissions = () => {
  const { data, isLoading, isFetching, isRefetching, refetch } = useMeQuery();

  const { user } = useSession();

  const defaultCompany = companyService.getDefaultCompany() as Company | null;
  const defaultCompanyId = defaultCompany?.id;
  const ownerId = defaultCompany?.ownerId;

  const companies = useMemo(() => data?.companyUser || [], [data]);

  const currentCompanyUser = useMemo(() => {
    if (!companies.length) {
      return undefined;
    }

    if (defaultCompanyId) {
      const matched = companies.find(
        (item) => item.companyId === defaultCompanyId
      );
      if (matched) {
        return matched;
      }
    }

    return companies[0];
  }, [companies, defaultCompanyId]);

  const companyRole = useMemo(() => {
    return (currentCompanyUser?.role as Role) || null;
  }, [currentCompanyUser]);

  const permissions = useMemo<Permission[]>(() => {
    return companyRole?.permissions || [];
  }, [companyRole]);

  const isOwner = user?.id === ownerId;

  const isAdmin = !!companyRole?.isAdmin || isOwner;

  const currentUserId = useMemo(() => {
    if (currentCompanyUser?.userId) {
      return currentCompanyUser.userId;
    }
    if (data?.id) {
      return data.id;
    }
    return "";
  }, [currentCompanyUser, data]);

  const subordinateIds = useMemo<string[]>(() => {
    const rawIds = (currentCompanyUser as unknown as { targetIds?: unknown })
      ?.targetIds;
    if (!Array.isArray(rawIds)) {
      return [];
    }
    return rawIds
      .map((value) => (value != null ? String(value) : ""))
      .filter((value) => !!value && value !== currentUserId);
  }, [currentCompanyUser, currentUserId]);

  const getModuleIdentifiers = useCallback((permission: Permission) => {
    const permissionData = permission as unknown as {
      module?: { code?: string };
      moduleCode?: string;
    };

    return [
      permission.moduleId,
      permissionData.moduleCode,
      permissionData.module?.code,
    ]
      .filter((value): value is string => !!value)
      .map((value) => value.trim().toLowerCase());
  }, []);

  const getModuleScope = useCallback(
    (moduleKey: string) => {
      if (!moduleKey) {
        return null;
      }

      if (isAdmin) {
        return "ALL" as Permission["scope"];
      }

      const normalizedKey = moduleKey.trim().toLowerCase();

      const matchedScopes = permissions
        .filter((item) => getModuleIdentifiers(item).includes(normalizedKey))
        .map((item) => item.scope);

      if (!matchedScopes.length) {
        return null;
      }

      return matchedScopes.reduce((current, scope) => {
        if (!current) {
          return scope;
        }
        return moduleScopeRank[scope] > moduleScopeRank[current]
          ? scope
          : current;
      }, matchedScopes[0]);
    },
    [getModuleIdentifiers, isAdmin, permissions]
  );

  const hasPermission = useCallback(
    (permissionKey: string, scope: PermissionScope = "read") => {
      if (!permissionKey) {
        return false;
      }

      if (isAdmin) {
        return true;
      }

      const normalizedKey = permissionKey.trim().toLowerCase();
      const requiredScope = scopeRank[scope];

      return permissions.some((item) => {
        const identifiers = getModuleIdentifiers(item);

        if (!identifiers.includes(normalizedKey)) {
          return false;
        }

        const currentPermissionLevel = permissionRank[item.permission] ?? 0;
        return currentPermissionLevel >= requiredScope;
      });
    },
    [getModuleIdentifiers, isAdmin, permissions]
  );

  const getScopedUserIds = useCallback(
    (moduleKey: string) => {
      const scope = getModuleScope(moduleKey);

      if (!scope) {
        return [] as string[];
      }

      if (scope === "ALL") {
        return null;
      }

      const ids = new Set<string>();

      if (currentUserId) {
        ids.add(currentUserId);
      }

      if (scope === "TEAM") {
        subordinateIds.forEach((id) => {
          if (id) {
            ids.add(id);
          }
        });
      }

      return Array.from(ids);
    },
    [currentUserId, getModuleScope, subordinateIds]
  );

  const isReady = !isLoading && !isFetching && !isRefetching;

  return {
    permissions,
    hasPermission,
    isAdmin,
    isOwner,
    role: companyRole,
    currentUserId,
    subordinateIds,
    getModuleScope,
    getScopedUserIds,
    isLoading,
    isFetching,
    isRefetching,
    isReady,
    refetch,
  };
};
