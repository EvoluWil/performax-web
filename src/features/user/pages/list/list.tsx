'use client';

import { Table } from '@/components/common';
import { ListHeader } from '@/components/common/list-header/list-header';
import { CsvImportModal, useListCsvImport } from '@/components/csv-import';
import { Actions } from '@/components/common/table/table';
import {
  UserClientsDrawer,
  UserDrawer,
  UserRoleDrawer,
  UserSubordinatesDrawer,
} from '@/features/user/components';
import { createUserCsvImportConfig } from '@/features/user/config/user-csv-import.config';
import { useUserMutation } from '@/features/user/hooks';
import { useCompanyPermissions } from '@/hooks/common/permission';
import { companyService } from '@/services/company.service';
import { User } from '@/types/user';
import { formatCpf } from '@/utils/cpf';
import {
  AddModeratorOutlined,
  DeleteOutlined,
  GroupAddOutlined,
  HandshakeOutlined,
} from '@mui/icons-material';
import { Typography } from '@mui/material';
import { MRT_ColumnDef } from 'material-react-table';
import { useCallback } from 'react';
import { UserFormDto } from '@/features/user/schemas/user-drawer.schema';
import { useUserList } from './list.hook';

const resolveRoleLabel = (data: User & { isOwner?: boolean }) => {
  if (data.isOwner) {
    return 'Proprietário';
  }
  const selectedCompany = companyService.getDefaultCompany();

  const companyUser = data.companyUser?.find(
    (cu) => cu.role?.companyId === selectedCompany?.id,
  );
  const userRole = companyUser?.role;

  if (userRole) {
    return (userRole as any).name || 'Usuário';
  }

  return 'Sem cargo';
};

const columns: MRT_ColumnDef<User>[] = [
  {
    accessorKey: 'name',
    header: 'Nome',
  },
  {
    accessorKey: 'email',
    header: 'E-mail',
  },
  {
    accessorKey: 'cpf',
    header: 'CPF',
    muiTableHeadCellProps: {
      align: 'center',
    },
    muiTableBodyCellProps: {
      align: 'center',
    },
    Cell({ cell }: any) {
      return formatCpf(cell.getValue());
    },
  },
  {
    id: 'role',
    accessorFn: (row) => resolveRoleLabel(row as User & { isOwner?: boolean }),
    header: 'Função',
    muiTableHeadCellProps: {
      align: 'center',
    },
    muiTableBodyCellProps: {
      align: 'center',
    },
    Cell({ cell }: any) {
      return cell.getValue();
    },
  },
];

export const UserList = () => {
  const {
    users,
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
    term,
    handleCloseAdd,
    handleCloseRoleModal,
    handleCloseSubordinatesModal,
    handleCloseClientsModal,
    handleDeleteUser,
    handleUpdateUserRole,
    handleUpdateUserSubordinates,
    handleUpdateUserClients,
    handleSelectUserToEdit,
    pagination,
    handlePaginationChange,
    count,
  } = useUserList();
  const userMutation = useUserMutation();

  const handleCreate = useCallback(
    (row: UserFormDto) => userMutation.mutateAsync({ type: 'create', data: row }),
    [userMutation],
  );

  const { importOpen, setImportOpen, config } = useListCsvImport(
    createUserCsvImportConfig,
    handleCreate,
    [handleCreate],
  );

  const { hasPermission, isReady: permissionsReady } = useCompanyPermissions();
  const canWrite = permissionsReady && hasPermission('user', 'write');
  const canAdmin = permissionsReady && hasPermission('user', 'admin');
  const canEdit = canWrite || canAdmin;

  const actions: Actions<User>[] = [];

  if (canAdmin) {
    actions.push({
      icon: () => <DeleteOutlined />,
      label: () => 'Excluir usuário',
      onClick: (user) => handleDeleteUser(user.id),
    });
  }

  if (canEdit) {
    actions.push(
      {
        icon: () => <AddModeratorOutlined />,
        label: (user) =>
          user.companyUser?.length ? 'Alterar cargo' : 'Adicionar cargo',
        onClick: handleUpdateUserRole,
      },
      {
        icon: () => <GroupAddOutlined />,
        label: () => 'Gerenciar subordinados',
        onClick: handleUpdateUserSubordinates,
      },
      {
        icon: () => <HandshakeOutlined />,
        label: () => 'Gerenciar clientes',
        onClick: handleUpdateUserClients,
      },
    );
  }

  return (
    <>
      <Typography variant="h5" gutterBottom color="primary" fontWeight="bold">
        USUÁRIOS
      </Typography>

      <ListHeader
        onAdd={canEdit ? handleOpenAdd : undefined}
        onImport={canEdit ? () => setImportOpen(true) : undefined}
        onReload={handleReload}
        onSearch={handleSearch}
        searchValue={term}
        searchTitle="Pesquise por nome, CPF ou e-mail"
        addTitle="Adicionar usuário"
      />
      <br />
      <Table
        columns={columns}
        data={users}
        emptyMessage="Nenhum resultado encontrado"
        onReload={handleReload}
        onRowClick={canEdit ? handleSelectUserToEdit : () => null}
        actions={actions}
        pagination={pagination}
        onPaginationChange={handlePaginationChange}
        rowCount={count}
      />

      {openModal && (
        <UserDrawer
          user={selectedUser}
          open={openModal}
          onClose={handleCloseAdd}
        />
      )}

      {openRoleModal && (
        <UserRoleDrawer
          user={selectedUserForRole}
          open={openRoleModal}
          onClose={handleCloseRoleModal}
        />
      )}

      {openSubordinatesModal && (
        <UserSubordinatesDrawer
          user={selectedUserForSubordinates}
          open={openSubordinatesModal}
          onClose={handleCloseSubordinatesModal}
        />
      )}

      {openClientsModal && (
        <UserClientsDrawer
          user={selectedUserForClients}
          open={openClientsModal}
          onClose={handleCloseClientsModal}
        />
      )}

      <CsvImportModal
        open={importOpen}
        onClose={() => setImportOpen(false)}
        config={config}
        onComplete={handleReload}
      />
    </>
  );
};
