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
import { FinanceSegmentDrawer } from '../../components/finance-segment-drawer/finance-segment-drawer';
import { createFinanceSegmentCsvImportConfig } from '../../config/finance-csv-import.configs';
import {
  useFinanceSegmentMutation,
  useFinanceSegmentsQuery,
} from '../../hooks/queries/finance-segments.query';
import type { FinanceSegment } from '../../types/finance-segment';

const columns: MRT_ColumnDef<FinanceSegment>[] = [
  { accessorKey: 'name', header: 'Nome' },
];

export const FinanceSegmentList = () => {
  const { data: segments, refetch } = useFinanceSegmentsQuery();
  const mutation = useFinanceSegmentMutation();
  const [openModal, setOpenModal] = useState(false);
  const [selected, setSelected] = useState<FinanceSegment | null>(null);
  const [term, setTerm] = useState('');

  const { hasPermission, isReady } = useCompanyPermissions();
  const canAdmin = isReady && hasPermission('financial', 'admin');

  const handleCreate = useCallback(
    (row: { name: string }) =>
      mutation.mutateAsync({ type: 'create', data: row }),
    [mutation],
  );

  const { importOpen, setImportOpen, config } = useListCsvImport(
    createFinanceSegmentCsvImportConfig,
    handleCreate,
    [handleCreate],
  );

  const handleReload = async () => {
    const { data } = await refetch();
    if (data) toast.success('Dados atualizados com sucesso');
  };

  const handleDelete = (id: string) => {
    swal.fire({
      title: 'Excluir segmento?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sim, excluir',
      cancelButtonText: 'Cancelar',
      preConfirm: async () => {
        await mutation.mutateAsync({ type: 'delete', id });
        toast.success('Segmento excluído com sucesso');
      },
    });
  };

  const actions: Actions<FinanceSegment>[] = [];
  if (canAdmin) {
    actions.push({
      icon: () => <DeleteOutlined />,
      label: () => 'Excluir',
      onClick: (s) => handleDelete(s.id),
    });
  }

  const filtered = (segments ?? []).filter((s) =>
    s.name?.toLowerCase().includes(term.toLowerCase()),
  );

  return (
    <>
      <Typography variant="h5" gutterBottom color="primary" fontWeight="bold">
        SEGMENTOS FINANCEIROS
      </Typography>
      <ListHeader
        onAdd={canAdmin ? () => setOpenModal(true) : undefined}
        onImport={canAdmin ? () => setImportOpen(true) : undefined}
        onReload={handleReload}
        onSearch={(s) => setTerm(s)}
        searchTitle="Pesquise por nome"
        addTitle="Adicionar segmento"
      />
      <Table
        data={filtered}
        columns={columns}
        actions={actions}
        onRowClick={(s) => {
          setSelected(s);
          setOpenModal(true);
        }}
      />
      <FinanceSegmentDrawer
        open={openModal}
        onClose={() => {
          setOpenModal(false);
          setSelected(null);
        }}
        financeSegment={selected}
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
