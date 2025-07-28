'use client';

import { Table } from '@/components/common';
import { ListHeader } from '@/components/common/list-header/list-header';
import { RoleDrawer } from '@/features/role/components';
import { Role } from '@/features/role/types';
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
  } = useRoleList();

  return (
    <>
      <Typography variant="h5" gutterBottom color="primary" fontWeight="bold">
        CARGOS
      </Typography>

      <ListHeader
        onAdd={handleOpenAdd}
        onReload={handleReload}
        onSearch={handleSearch}
        searchTitle="Pesquise por nome ou descrição"
        addTitle="Adicionar cargo"
      />
      <br />
      <Table
        columns={columns}
        data={roles}
        emptyMessage="Nenhum resultado encontrado"
        onReload={handleReload}
        onRowClick={handleSelectRoleToEdit}
        actions={[
          {
            icon: () => <DeleteOutlined />,
            label: () => 'Excluir cargo',
            onClick: (role) => handleDeleteRole(role.id),
          },
        ]}
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
