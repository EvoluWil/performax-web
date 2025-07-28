import { useUserMutation, useUsersQuery } from '@/features/user/hooks';
import { User } from '@/types/user';
import { useState } from 'react';
import { toast } from 'react-toastify';
import swal from 'sweetalert2';

export const useUserList = () => {
  const {
    data: { data: users },
    refetch,
  } = useUsersQuery();
  const [openModal, setOpenModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [term, setTerm] = useState('');

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

  const handleReload = async () => {
    const { data } = await refetch();
    if (data) {
      toast.success('Dados atualizados com sucesso');
    }
  };

  const handleSearch = async (search: string) => {
    setTerm(search);
  };

  const filteredUsers = users?.filter(
    (user) =>
      user.name?.toLowerCase().includes(term.toLowerCase()) ||
      user.cpf?.toLowerCase().includes(term.toLowerCase()) ||
      user.email?.toLowerCase().includes(term.toLowerCase()),
  );

  return {
    users: filteredUsers,
    openModal,
    selectedUser,
    handleOpenAdd,
    handleReload,
    handleSearch,
    handleCloseAdd,
    handleDeleteUser,
    handleSelectUserToEdit,
  };
};
