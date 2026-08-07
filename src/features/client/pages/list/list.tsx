'use client';

import { Table } from '@/components/common';
import { ListHeader } from '@/components/common/list-header/list-header';
import { CsvImportModal, useListCsvImport } from '@/components/csv-import';
import { Actions } from '@/components/common/table/table';
import { ClientDrawer } from '@/features/client/components';
import { createClientCsvImportConfig } from '@/features/client/config/client-csv-import.config';
import { useClientMutation } from '@/features/client/hooks';
import { ClientFormDto } from '@/features/client/schemas';
import { Client } from '@/features/client/types';
import { useCompanyPermissions } from '@/hooks/common/permission';
import { formatCnpj } from '@/utils/cnpj';
import { formatCpf } from '@/utils/cpf';
import { DeleteOutlined, ReceiptOutlined } from '@mui/icons-material';
import { Chip, Typography } from '@mui/material';
import { MRT_ColumnDef } from 'material-react-table';
import { useCallback } from 'react';
import { useClientList } from './list.hook';

const columns: MRT_ColumnDef<Client>[] = [
  {
    accessorKey: 'name',
    header: 'Nome',
  },
  {
    id: 'document',
    header: 'CPF/CNPJ',
    muiTableHeadCellProps: { align: 'center' },
    muiTableBodyCellProps: { align: 'center' },
    Cell({ row }) {
      const client = row.original;
      if (client.personType === 'PF' || client.cpf) {
        return formatCpf(client.cpf ?? '');
      }
      return formatCnpj(client.cnpj ?? '');
    },
  },
  {
    id: 'fiscalAddress',
    header: 'Endereço',
    Cell({ row }) {
      const fa = row.original.fiscalAddress;
      if (fa?.street) {
        return [fa.street, fa.city, fa.state].filter(Boolean).join(', ');
      }
      return row.original.address || '-';
    },
  },
  {
    accessorKey: 'email',
    header: 'E-mail',
  },
  {
    id: 'fiscal',
    header: 'Fiscal',
    size: 80,
    muiTableHeadCellProps: { align: 'center' },
    muiTableBodyCellProps: { align: 'center' },
    Cell() {
      return (
        <Chip
          icon={<ReceiptOutlined />}
          label="Ver detalhe"
          size="small"
          variant="outlined"
        />
      );
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
    term,
    handleCloseAdd,
    handleDeleteClient,
    handleSelectClientToEdit,
    handlePaginationChange,
    pagination,
    count,
  } = useClientList();
  const clientMutation = useClientMutation();

  const handleCreate = useCallback(
    (row: ClientFormDto) =>
      clientMutation.mutateAsync({ type: 'create', data: row }),
    [clientMutation],
  );

  const { importOpen, setImportOpen, config } = useListCsvImport(
    createClientCsvImportConfig,
    handleCreate,
    [handleCreate],
  );

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
        onImport={canEdit ? () => setImportOpen(true) : undefined}
        onReload={handleReload}
        onSearch={handleSearch}
        searchValue={term}
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

      <CsvImportModal
        open={importOpen}
        onClose={() => setImportOpen(false)}
        config={config}
        onComplete={handleReload}
      />
    </>
  );
};
