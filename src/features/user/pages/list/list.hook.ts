import { Pagination } from '@/components/common/table/table';
import { useUserMutation, useUsersQuery } from '@/features/user/hooks';
import { useCompanyPermissions } from '@/hooks/common/permission';
import { companyService } from '@/services/company.service';
import { User } from '@/types/user';
import { useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import swal from 'sweetalert2';

export const useUserList = () => {
  const { getScopedUserIds } = useCompanyPermissions();

  const scopedUserIds = useMemo(
    () => getScopedUserIds('user'),
    [getScopedUserIds],
  );

  const hasUserAccess = scopedUserIds === null || scopedUserIds.length > 0;

  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 30 });

  const { data, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useUsersQuery({
      scopeModule: 'user',
      pageSize: pagination.pageSize,
    });

  const users = data?.users ?? [];
  const count = data?.count ?? 0;
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
    null,
  );
  const [term, setTerm] = useState('');

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
      title: 'Tem certeza que deseja excluir este usuário?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sim, excluir',
      cancelButtonText: 'Cancelar',
      preConfirm: async () => {
        const result = await userMutation.mutateAsync({
          type: 'delete',
          id: userId,
        });

        if (result) {
          toast.success('Usuário excluído com sucesso');
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
      toast.info('Você não possui permissão para visualizar usuários.');
      return;
    }

    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    const { data } = await refetch();
    if (data) {
      toast.success('Dados atualizados com sucesso');
    }
  };

  const handleSearch = async (search: string) => {
    setTerm(search);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  const filteredUsers = (hasUserAccess ? users : []).filter(
    (user) =>
      user.name?.toLowerCase().includes(term.toLowerCase()) ||
      user.cpf?.toLowerCase().includes(term.toLowerCase()) ||
      user.email?.toLowerCase().includes(term.toLowerCase()),
  );

  const mappedUsers = filteredUsers?.map((user) => ({
    ...user,
    isOwner: user.id === company?.ownerId,
  }));

  const handlePaginationChange = async (newPagination: Pagination) => {
    if (JSON.stringify(newPagination) === JSON.stringify(pagination)) return;

    if (newPagination.pageIndex === pagination.pageIndex) {
      setPagination((prev) => ({ ...prev, pageSize: newPagination.pageSize }));
      return;
    }

    const requiredCount =
      (newPagination.pageIndex + 1) * newPagination.pageSize;

    setPagination(newPagination);

    if (users.length < requiredCount && hasNextPage && !isFetchingNextPage) {
      await fetchNextPage();
    }
  };

  const paginatedUsers = mappedUsers.slice(
    pagination.pageIndex * pagination.pageSize,
    (pagination.pageIndex + 1) * pagination.pageSize,
  );

  return {
    users: paginatedUsers,
    count,
    pagination,
    handlePaginationChange,
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
