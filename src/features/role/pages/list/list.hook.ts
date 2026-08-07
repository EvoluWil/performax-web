import { Pagination } from '@/components/common/table/table';
import {
  useRoleMutation,
  useRolesQuery,
} from '@/features/role/hooks/queries/roles.query';
import { Role } from '@/features/role/types';
import { useListUrlEffects, useSimpleListUrlState } from '@/hooks/common/use-list-url-state';
import { useState } from 'react';
import { toast } from 'react-toastify';
import swal from 'sweetalert2';

export const useRoleList = () => {
  const { data: roles, refetch } = useRolesQuery();
  const {
    q: urlQ,
    pagination: urlPagination,
    hasUrlParams,
    syncUrl,
  } = useSimpleListUrlState();

  const [openModal, setOpenModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [term, setTerm] = useState(urlQ);
  const [pagination, setPagination] = useState(urlPagination);

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

  const filteredRoles = roles?.filter(
    (role) =>
      role.name.toLowerCase().includes(term.toLowerCase()) ||
      role.description?.toLowerCase().includes(term.toLowerCase()),
  );

  const handlePaginationChange = (newPagination: Pagination) => {
    if (JSON.stringify(newPagination) === JSON.stringify(pagination)) return;
    setPagination(newPagination);
  };

  const count = filteredRoles?.length ?? 0;

  const paginatedRoles = filteredRoles?.slice(
    pagination.pageIndex * pagination.pageSize,
    (pagination.pageIndex + 1) * pagination.pageSize,
  );

  useListUrlEffects({
    hasUrlParams,
    urlState: { q: urlQ, pagination: urlPagination, filter: {} },
    state: { q: term, pagination, filter: {} },
    syncUrl,
  });

  return {
    roles: paginatedRoles,
    term,
    count,
    pagination,
    handlePaginationChange,
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
