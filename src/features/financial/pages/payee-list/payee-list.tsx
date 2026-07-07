'use client';

import { ListHeader, Table } from '@/components/common';
import { CsvImportModal, useListCsvImport } from '@/components/csv-import';
import { Actions } from '@/components/common/table/table';
import { useCompanyPermissions } from '@/hooks/common/permission';
import { DeleteOutlined } from '@mui/icons-material';
import { Typography } from '@mui/material';
import { MRT_ColumnDef } from 'material-react-table';
import { useCallback, useState } from 'react';
import { toast } from 'react-toastify';
import swal from 'sweetalert2';
import { FinancePayeeDrawer } from '../../components/finance-payee-drawer/finance-payee-drawer';
import { createFinancePayeeCsvImportConfig } from '../../config/finance-csv-import.configs';
import {
  useFinancePayeeMutation,
  useFinancePayeesQuery,
} from '../../hooks/queries/finance-payees.query';
import type { FinancePayee } from '../../types/finance-payee';

const columns: MRT_ColumnDef<FinancePayee>[] = [
  { accessorKey: 'name', header: 'Nome' },
];

export const FinancePayeeList = () => {
  const { data: payees, refetch } = useFinancePayeesQuery();
  const mutation = useFinancePayeeMutation();
  const [openModal, setOpenModal] = useState(false);
  const [selected, setSelected] = useState<FinancePayee | null>(null);
  const [term, setTerm] = useState('');

  const { hasPermission, isReady } = useCompanyPermissions();
  const canAdmin = isReady && hasPermission('financial', 'admin');

  const handleCreate = useCallback(
    (row: { name: string }) =>
      mutation.mutateAsync({ type: 'create', data: row }),
    [mutation],
  );

  const { importOpen, setImportOpen, config } = useListCsvImport(
    createFinancePayeeCsvImportConfig,
    handleCreate,
    [handleCreate],
  );

  const handleReload = async () => {
    const { data } = await refetch();
    if (data) toast.success('Dados atualizados com sucesso');
  };

  const handleDelete = (id: string) => {
    swal.fire({
      title: 'Excluir favorecido?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sim, excluir',
      cancelButtonText: 'Cancelar',
      preConfirm: async () => {
        await mutation.mutateAsync({ type: 'delete', id });
        toast.success('Favorecido excluído com sucesso');
      },
    });
  };

  const actions: Actions<FinancePayee>[] = [];
  if (canAdmin) {
    actions.push({
      icon: () => <DeleteOutlined />,
      label: () => 'Excluir',
      onClick: (p) => handleDelete(p.id),
    });
  }

  const filtered = (payees ?? []).filter((p) =>
    p.name?.toLowerCase().includes(term.toLowerCase()),
  );

  return (
    <>
      <Typography variant="h5" gutterBottom color="primary" fontWeight="bold">
        FAVORECIDOS
      </Typography>
      <ListHeader
        onAdd={canAdmin ? () => setOpenModal(true) : undefined}
        onImport={canAdmin ? () => setImportOpen(true) : undefined}
        onReload={handleReload}
        onSearch={(s) => setTerm(s)}
        searchTitle="Pesquise por nome"
        addTitle="Adicionar favorecido"
      />
      <Table
        data={filtered}
        columns={columns}
        actions={actions}
        onRowClick={(p) => {
          setSelected(p);
          setOpenModal(true);
        }}
      />
      <FinancePayeeDrawer
        open={openModal}
        onClose={() => {
          setOpenModal(false);
          setSelected(null);
        }}
        financePayee={selected}
      />
      <CsvImportModal
        open={importOpen}
        onClose={() => setImportOpen(false)}
        config={config}
        onComplete={handleReload}
      />
    </>
  );
};
