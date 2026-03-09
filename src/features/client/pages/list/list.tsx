'use client';

import { Table } from '@/components/common';
import { ListHeader } from '@/components/common/list-header/list-header';
import { Actions } from '@/components/common/table/table';
import { ClientDrawer } from '@/features/client/components';
import { Client } from '@/features/client/types';
import { useCompanyPermissions } from '@/hooks/common/permission';
import { formatCnpj } from '@/utils/cnpj';
import { DeleteOutlined } from '@mui/icons-material';
import { Typography } from '@mui/material';
import { MRT_ColumnDef } from 'material-react-table';
import { useClientList } from './list.hook';

const columns: MRT_ColumnDef<Client>[] = [
  {
    accessorKey: 'name',
    header: 'Nome',
  },
  {
    accessorKey: 'address',
    header: 'Endereço',
  },
  {
    accessorKey: 'cnpj',
    header: 'CNPJ',
    muiTableHeadCellProps: {
      align: 'center',
    },
    muiTableBodyCellProps: {
      align: 'center',
    },
    Cell({ cell }: any) {
      return formatCnpj(cell.getValue());
    },
  },
];

export const ClientList = () => {
  const {
    clients,
    openModal,
    selectedClient,
    handleOpenAdd,
    handleReload,
    handleSearch,
    handleCloseAdd,
    handleDeleteClient,
    handleSelectClientToEdit,
    handlePaginationChange,
    pagination,
    count,
  } = useClientList();
  const { hasPermission, isReady: permissionsReady } = useCompanyPermissions();
  const canWrite = permissionsReady && hasPermission('client', 'write');
  const canAdmin = permissionsReady && hasPermission('client', 'admin');
  const canEdit = canWrite || canAdmin;

  const actions: Actions<Client>[] = [];

  if (canAdmin) {
    actions.push({
      icon: () => <DeleteOutlined />,
      label: () => 'Excluir cliente',
      onClick: (client) => handleDeleteClient(client.id),
    });
  }

  return (
    <>
      <Typography variant="h5" gutterBottom color="primary" fontWeight="bold">
        CLIENTES
      </Typography>

      <ListHeader
        onAdd={canEdit ? handleOpenAdd : undefined}
        onReload={handleReload}
        onSearch={handleSearch}
        searchTitle="Pesquise por nome, CNPJ ou endereço"
        addTitle="Adicionar cliente"
      />
      <br />
      <Table
        columns={columns}
        data={clients}
        emptyMessage="Nenhum resultado encontrado"
        onReload={handleReload}
        onRowClick={canEdit ? handleSelectClientToEdit : () => null}
        actions={actions}
        pagination={pagination}
        onPaginationChange={handlePaginationChange}
        rowCount={count}
      />

      {openModal && (
        <ClientDrawer
          client={selectedClient}
          open={openModal}
          onClose={handleCloseAdd}
        />
      )}
    </>
  );
};
