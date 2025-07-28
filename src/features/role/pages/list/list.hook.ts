import {
  useRoleMutation,
  useRolesQuery,
} from '@/features/role/hooks/queries/roles.query';
import { Role } from '@/features/role/types';
import { useState } from 'react';
import { toast } from 'react-toastify';
import swal from 'sweetalert2';

export const useRoleList = () => {
  const { data: roles, refetch } = useRolesQuery();
  const [openModal, setOpenModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [term, setTerm] = useState('');

  const roleMutation = useRoleMutation();

  const handleOpenAdd = async () => {
    setOpenModal(true);
  };

  const handleCloseAdd = () => {
    setOpenModal(false);
    setSelectedRole(null);
  };

  const handleSelectRoleToEdit = (role: Role) => {
    setSelectedRole(role);
    setOpenModal(true);
  };

  const handleDeleteRole = async (roleId: string) => {
    swal.fire({
      title: 'Tem certeza que deseja excluir este cargo?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sim, excluir',
      cancelButtonText: 'Cancelar',
      preConfirm: async () => {
        const result = await roleMutation.mutateAsync({
          type: 'delete',
          id: roleId,
        });

        if (result) {
          toast.success('Cargo excluído com sucesso');
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

  const filteredRoles = roles?.filter(
    (role) =>
      role.name.toLowerCase().includes(term.toLowerCase()) ||
      role.description?.toLowerCase().includes(term.toLowerCase()),
  );

  return {
    roles: filteredRoles,
    openModal,
    selectedRole,
    handleOpenAdd,
    handleReload,
    handleSearch,
    handleCloseAdd,
    handleDeleteRole,
    handleSelectRoleToEdit,
  };
};
