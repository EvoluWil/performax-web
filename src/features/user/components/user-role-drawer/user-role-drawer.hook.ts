import { useRolesQuery } from "@/features/role/hooks";
import { Role } from "@/features/role/types";
import { useUserRoleMutation } from "@/features/user/hooks";
import {
  UserRoleFormDto,
  userRoleFormInitialValues,
  userRoleFormSchema,
} from "@/features/user/schemas";
import { User } from "@/types/user";
import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

export type UserRoleDrawerProps = {
  open: boolean;
  onClose: () => void;
  user: User | null;
};

export const useUserRoleDrawer = ({
  onClose,
  open,
  user,
}: UserRoleDrawerProps) => {
  const mutation = useUserRoleMutation();
  const { data: roles = [] } = useRolesQuery();

  const { control, handleSubmit, reset, watch } = useForm<UserRoleFormDto>({
    defaultValues: userRoleFormInitialValues,
    resolver: yupResolver(userRoleFormSchema),
  });

  const initialRole = user?.companyUser?.[0]?.role as Role;
  const selectedRoleId = watch("roleId");
  const hasUpdatedRole = !initialRole
    ? false
    : selectedRoleId !== initialRole.id;

  const handleAssignRole = handleSubmit(async (data: UserRoleFormDto) => {
    if (!user?.id) return;

    const result = await mutation.mutateAsync({
      type: "assign",
      data: {
        userId: user.id,
        roleId: data.roleId,
      },
    });

    if (result) {
      toast.success(
        initialRole
          ? "Cargo alterado com sucesso"
          : "Cargo atribuído com sucesso"
      );
      handleClose();
    }
  });

  const handleRemoveRole = async () => {
    if (!user?.id) return;

    const result = await mutation.mutateAsync({
      type: "remove",
      userId: user.id,
    });

    if (result) {
      toast.success("Cargo removido com sucesso");
      handleClose();
    }
  };

  const handleClose = () => {
    onClose();
    reset();
  };

  useEffect(() => {
    if (user?.companyUser?.[0]?.role) {
      reset({ roleId: initialRole?.id || "" });
    } else {
      reset(userRoleFormInitialValues);
    }
  }, [user, reset, initialRole]);

  return {
    control,
    handleAssignRole,
    handleRemoveRole,
    loading: mutation.isPending,
    handleClose,
    open,
    roles,
    hasRole: !!initialRole,
    hasUpdatedRole,
  };
};
