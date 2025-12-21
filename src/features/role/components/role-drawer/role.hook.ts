import { useRoleMutation } from "@/features/role/hooks";
import {
  RoleFormDto,
  roleFormInitialValues,
  roleFormSchema,
} from "@/features/role/schemas";
import { Permission } from "@/features/role/types";
import { useCompanyModulesQuery } from "@/hooks/queries/company-modules.query";
import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { RoleDrawerProps } from "./role";

export const useRoleDrawer = ({ onClose, open, role }: RoleDrawerProps) => {
  const { data: companyModules } = useCompanyModulesQuery();
  const roleMutation = useRoleMutation();

  const [permissions, setPermissions] = useState<Permission[]>(
    () => role?.permissions?.map((p) => ({ ...p })) || []
  );

  const { control, handleSubmit, reset, watch } = useForm<RoleFormDto>({
    defaultValues: roleFormInitialValues,
    resolver: yupResolver(roleFormSchema),
  });

  const isAdmin = watch("isAdmin");

  const handleRole = handleSubmit(async (data: RoleFormDto) => {
    const result = await roleMutation.mutateAsync({
      type: role ? "update" : "create",
      data: { ...data, permissions: isAdmin ? [] : permissions },
      id: role?.id,
    });

    if (result) {
      toast.success(
        role ? "Cargo atualizado com sucesso" : "Cargo criado com sucesso"
      );
      handleClose();
      onClose();
    }
  });

  const handleClose = () => {
    onClose();
    reset();
  };

  const handleUpdatePermissions = (moduleId: string) => {
    setPermissions((prev) => {
      const isSelected = prev.some((p) => p.moduleId === moduleId);
      if (isSelected) {
        return prev.filter((p) => p.moduleId !== moduleId);
      }
      const moduleData = companyModules?.find(
        (item) => item.moduleId === moduleId
      )?.module;

      if (!moduleData) {
        return prev;
      }

      return [
        ...prev,
        {
          moduleId,
          permission: "READ",
          scope: "SELF",
          module: moduleData,
        },
      ];
    });
  };

  const handleUpdatePermissionLevel = (
    moduleId: string,
    permission: Permission["permission"]
  ) => {
    setPermissions((prev) => {
      return prev.map((p) =>
        p.moduleId === moduleId ? { ...p, permission } : p
      );
    });
  };

  const handleUpdatePermissionScope = (
    moduleId: string,
    scope: Permission["scope"]
  ) => {
    setPermissions((prev) => {
      return prev.map((p) => (p.moduleId === moduleId ? { ...p, scope } : p));
    });
  };

  useEffect(() => {
    if (role) {
      reset({
        name: role.name,
        description: role.description,
        isAdmin: role.isAdmin,
      });
      setPermissions(role.permissions?.map((p) => ({ ...p })) || []);
    } else {
      reset(roleFormInitialValues);
      setPermissions([]);
    }
  }, [role, reset]);

  return {
    companyModules,
    control,
    handleRole,
    loading: roleMutation.isPending,
    handleClose,
    open,
    permissions,
    handleUpdatePermissions,
    handleUpdatePermissionLevel,
    handleUpdatePermissionScope,
    isAdmin,
    editing: !!role,
  };
};
