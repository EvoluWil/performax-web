'use client';

import { Table } from '@/components/common';
import { ListHeader } from '@/components/common/list-header/list-header';
import { Actions } from '@/components/common/table/table';
import { RoleDrawer } from '@/features/role/components';
import { Role } from '@/features/role/types';
import { useCompanyPermissions } from '@/hooks/common/permission';
import { DeleteOutlined } from '@mui/icons-material';
import { Typography } from '@mui/material';
import { MRT_ColumnDef } from 'material-react-table';
import { useRoleList } from './list.hook';

const columns: MRT_ColumnDef<Role>[] = [
  {
    accessorKey: 'name',
    header: 'Título',
  },
  {
    accessorKey: 'description',
    header: 'Descrição',
  },
  {
    accessorKey: 'createdAt',
    header: 'Criado em',
    muiTableHeadCellProps: {
      align: 'center',
    },
    muiTableBodyCellProps: {
      align: 'center',
    },
    Cell({ cell }: any) {
      return new Date(cell.getValue()).toLocaleDateString('pt-BR');
    },
  },
];

export const RoleList = () => {
  const {
    roles,
    openModal,
    selectedRole,
    handleOpenAdd,
    handleReload,
    handleSearch,
    handleCloseAdd,
    handleDeleteRole,
    handleSelectRoleToEdit,
    pagination,
    handlePaginationChange,
    count,
  } = useRoleList();
  const { hasPermission, isReady: permissionsReady } = useCompanyPermissions();
  const canWrite = permissionsReady && hasPermission('role', 'write');
  const canAdmin = permissionsReady && hasPermission('role', 'admin');
  const canEdit = canWrite || canAdmin;

  const actions: Actions<Role>[] = [];

  if (canAdmin) {
    actions.push({
      icon: () => <DeleteOutlined />,
      label: () => 'Excluir cargo',
      onClick: (role) => handleDeleteRole(role.id),
    });
  }

  return (
    <>
      <Typography variant="h5" gutterBottom color="primary" fontWeight="bold">
        CARGOS
      </Typography>

      <ListHeader
        onAdd={canEdit ? handleOpenAdd : undefined}
        onReload={handleReload}
        onSearch={handleSearch}
        searchTitle="Pesquise por nome ou descrição"
        addTitle="Adicionar cargo"
      />
      <br />
      <Table
        columns={columns}
        data={roles || []}
        emptyMessage="Nenhum resultado encontrado"
        onReload={handleReload}
        onRowClick={canEdit ? handleSelectRoleToEdit : () => null}
        actions={actions}
        pagination={pagination}
        onPaginationChange={handlePaginationChange}
        rowCount={count}
      />

      {openModal && (
        <RoleDrawer
          role={selectedRole}
          open={openModal}
          onClose={handleCloseAdd}
        />
      )}
    </>
  );
};
