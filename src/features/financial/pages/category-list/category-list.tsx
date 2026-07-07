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
import { FinanceCategoryDrawer } from '../../components/finance-category-drawer/finance-category-drawer';
import { createFinanceCategoryCsvImportConfig } from '../../config/finance-csv-import.configs';
import {
  useFinanceCategoriesQuery,
  useFinanceCategoryMutation,
} from '../../hooks/queries/finance-categories.query';
import type { FinanceCategory } from '../../types/finance-category';

const columns: MRT_ColumnDef<FinanceCategory>[] = [
  { accessorKey: 'name', header: 'Nome' },
];

export const FinanceCategoryList = () => {
  const { data: categories, refetch } = useFinanceCategoriesQuery();
  const mutation = useFinanceCategoryMutation();
  const [openModal, setOpenModal] = useState(false);
  const [selected, setSelected] = useState<FinanceCategory | null>(null);
  const [term, setTerm] = useState('');

  const { hasPermission, isReady } = useCompanyPermissions();
  const canAdmin = isReady && hasPermission('financial', 'admin');

  const handleCreate = useCallback(
    (row: { name: string }) =>
      mutation.mutateAsync({ type: 'create', data: row }),
    [mutation],
  );

  const { importOpen, setImportOpen, config } = useListCsvImport(
    createFinanceCategoryCsvImportConfig,
    handleCreate,
    [handleCreate],
  );

  const handleReload = async () => {
    const { data } = await refetch();
    if (data) toast.success('Dados atualizados com sucesso');
  };

  const handleDelete = (id: string) => {
    swal.fire({
      title: 'Excluir categoria?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sim, excluir',
      cancelButtonText: 'Cancelar',
      preConfirm: async () => {
        await mutation.mutateAsync({ type: 'delete', id });
        toast.success('Categoria excluída com sucesso');
      },
    });
  };

  const actions: Actions<FinanceCategory>[] = [];
  if (canAdmin) {
    actions.push({
      icon: () => <DeleteOutlined />,
      label: () => 'Excluir',
      onClick: (c) => handleDelete(c.id),
    });
  }

  const filtered = (categories ?? []).filter((c) =>
    c.name?.toLowerCase().includes(term.toLowerCase()),
  );

  return (
    <>
      <Typography variant="h5" gutterBottom color="primary" fontWeight="bold">
        CATEGORIAS FINANCEIRAS
      </Typography>
      <ListHeader
        onAdd={canAdmin ? () => setOpenModal(true) : undefined}
        onImport={canAdmin ? () => setImportOpen(true) : undefined}
        onReload={handleReload}
        onSearch={(s) => setTerm(s)}
        searchTitle="Pesquise por nome"
        addTitle="Adicionar categoria"
      />
      <Table
        data={filtered}
        columns={columns}
        actions={actions}
        onRowClick={(c) => {
          setSelected(c);
          setOpenModal(true);
        }}
      />
      <FinanceCategoryDrawer
        open={openModal}
        onClose={() => {
          setOpenModal(false);
          setSelected(null);
        }}
        financeCategory={selected}
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
