import { useUserMutation, useUsersQuery } from "@/features/user/hooks";
import { useCompanyPermissions } from "@/hooks/common/permission";
import { companyService } from "@/services/company.service";
import { User } from "@/types/user";
import { useMemo, useState } from "react";
import { toast } from "react-toastify";
import swal from "sweetalert2";

export const useUserList = () => {
  const { getScopedUserIds } = useCompanyPermissions();

  const scopedUserIds = useMemo(
    () => getScopedUserIds("user"),
    [getScopedUserIds]
  );

  const hasUserAccess = scopedUserIds === null || scopedUserIds.length > 0;

  const { data: usersResponse, refetch } = useUsersQuery({
    scopeModule: "user",
  });

  const users = usersResponse?.data || [];
  const [openModal, setOpenModal] = useState(false);
  const [openRoleModal, setOpenRoleModal] = useState(false);
  const [openSubordinatesModal, setOpenSubordinatesModal] = useState(false);
  const [openClientsModal, setOpenClientsModal] = useState(false);
  const [selectedUserForSubordinates, setSelectedUserForSubordinates] =
    useState<User | null>(null);
  const [selectedUserForClients, setSelectedUserForClients] =
    useState<User | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedUserForRole, setSelectedUserForRole] = useState<User | null>(
    null
  );
  const [term, setTerm] = useState("");

  const company = companyService.getDefaultCompany();

  const userMutation = useUserMutation();

  const handleOpenAdd = async () => {
    setOpenModal(true);
  };

  const handleCloseAdd = () => {
    setOpenModal(false);
    setSelectedUser(null);
  };

  const handleSelectUserToEdit = (user: User) => {
    setSelectedUser(user);
    setOpenModal(true);
  };

  const handleDeleteUser = async (userId: string) => {
    swal.fire({
      title: "Tem certeza que deseja excluir este usuário?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sim, excluir",
      cancelButtonText: "Cancelar",
      preConfirm: async () => {
        const result = await userMutation.mutateAsync({
          type: "delete",
          id: userId,
        });

        if (result) {
          toast.success("Usuário excluído com sucesso");
        }
      },
    });
  };

  const handleUpdateUserRole = async (user: User) => {
    setSelectedUserForRole(user);
    setOpenRoleModal(true);
  };

  const handleCloseRoleModal = () => {
    setOpenRoleModal(false);
    setSelectedUserForRole(null);
  };

  const handleUpdateUserSubordinates = async (user: User) => {
    setSelectedUserForSubordinates(user);
    setOpenSubordinatesModal(true);
  };

  const handleCloseSubordinatesModal = () => {
    setOpenSubordinatesModal(false);
    setSelectedUserForSubordinates(null);
  };

  const handleUpdateUserClients = async (user: User) => {
    setSelectedUserForClients(user);
    setOpenClientsModal(true);
  };

  const handleCloseClientsModal = () => {
    setOpenClientsModal(false);
    setSelectedUserForClients(null);
  };

  const handleReload = async () => {
    if (!hasUserAccess) {
      toast.info("Você não possui permissão para visualizar usuários.");
      return;
    }

    const { data } = await refetch();
    if (data) {
      toast.success("Dados atualizados com sucesso");
    }
  };

  const handleSearch = async (search: string) => {
    setTerm(search);
  };

  const filteredUsers = (hasUserAccess ? users : []).filter(
    (user) =>
      user.name?.toLowerCase().includes(term.toLowerCase()) ||
      user.cpf?.toLowerCase().includes(term.toLowerCase()) ||
      user.email?.toLowerCase().includes(term.toLowerCase())
  );

  const mappedUsers = filteredUsers?.map((user) => ({
    ...user,
    isOwner: user.id === company?.ownerId,
  }));

  return {
    users: mappedUsers,
    openModal,
    openRoleModal,
    openSubordinatesModal,
    openClientsModal,
    selectedUser,
    selectedUserForRole,
    selectedUserForSubordinates,
    selectedUserForClients,
    handleOpenAdd,
    handleReload,
    handleSearch,
    handleCloseAdd,
    handleCloseRoleModal,
    handleCloseSubordinatesModal,
    handleDeleteUser,
    handleSelectUserToEdit,
    handleUpdateUserRole,
    handleUpdateUserSubordinates,
    handleUpdateUserClients,
    handleCloseClientsModal,
  };
};
