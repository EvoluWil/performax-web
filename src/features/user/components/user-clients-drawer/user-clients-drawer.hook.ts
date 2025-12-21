import { useClientsQuery } from "@/features/client/hooks";
import { Client } from "@/features/client/types";
import { useUserRolesQuery } from "@/features/user/hooks";
import {
  UserClientsFormDto,
  userClientsFormInitialValues,
  userClientsFormSchema,
} from "@/features/user/schemas";
import { User } from "@/types/user";
import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { useUserRoleClientsMutation } from "../../hooks/queries/user-role.query";

export type UserClientsDrawerProps = {
  open: boolean;
  onClose: () => void;
  user: User | null;
};

export const useUserClientsDrawer = ({
  onClose,
  open,
  user,
}: UserClientsDrawerProps) => {
  const mutation = useUserRoleClientsMutation();
  const { data: clientsData } = useClientsQuery({ scopeModule: "client" });
  const { data: currentAssignments } = useUserRolesQuery(
    user?.id || "",
    !!user?.id
  );

  const { control, handleSubmit, reset, watch, setValue } =
    useForm<UserClientsFormDto>({
      defaultValues: userClientsFormInitialValues,
      resolver: yupResolver(userClientsFormSchema),
    });

  const watchedClientIds = watch("clientIds") || [];

  const availableClients: Client[] = clientsData?.data || [];

  const selectedClients = availableClients.filter((client) =>
    watchedClientIds.includes(client.id)
  );

  const handleAssignClients = handleSubmit(async (data: UserClientsFormDto) => {
    if (!user?.id) return;

    await mutation.mutateAsync({
      userId: user.id,
      data,
    });

    toast.success("Clientes atualizados com sucesso");
    handleClose();
  });

  const handleClose = () => {
    onClose();
    reset();
  };

  useEffect(() => {
    setValue("clientIds", currentAssignments?.clientIds || []);
  }, [currentAssignments, setValue]);

  return {
    control,
    handleAssignClients,
    loading: mutation.isPending,
    handleClose,
    open,
    availableClients,
    selectedClients,
  };
};
