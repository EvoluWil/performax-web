'use client';

import { Table } from '@/components/common';
import { ListHeader } from '@/components/common/list-header/list-header';
import { ClientDrawer } from '@/features/client/components';
import { Client } from '@/features/client/types';
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
  } = useClientList();

  return (
    <>
      <Typography variant="h5" gutterBottom color="primary" fontWeight="bold">
        CLIENTES
      </Typography>

      <ListHeader
        onAdd={handleOpenAdd}
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
        onRowClick={handleSelectClientToEdit}
        actions={[
          {
            icon: () => <DeleteOutlined />,
            label: () => 'Excluir cliente',
            onClick: (client) => handleDeleteClient(client.id),
          },
        ]}
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
