'use client';

import { ListHeader, Table } from '@/components/common';
import { Actions } from '@/components/common/table/table';
import { useCompanyPermissions } from '@/hooks/common/permission';
import { DeleteOutlined } from '@mui/icons-material';
import { Typography } from '@mui/material';
import { MRT_ColumnDef } from 'material-react-table';
import { useState } from 'react';
import { toast } from 'react-toastify';
import swal from 'sweetalert2';
import { FinanceBankDrawer } from '../../components/finance-bank-drawer/finance-bank-drawer';
import {
  useFinanceBankMutation,
  useFinanceBanksQuery,
} from '../../hooks/queries/finance-banks.query';
import type { FinanceBank } from '../../types/finance-bank';

const columns: MRT_ColumnDef<FinanceBank>[] = [
  { accessorKey: 'name', header: 'Nome' },
  { accessorKey: 'code', header: 'Código' },
];

export const FinanceBankList = () => {
  const { data: banks, refetch } = useFinanceBanksQuery();
  const mutation = useFinanceBankMutation();
  const [openModal, setOpenModal] = useState(false);
  const [selected, setSelected] = useState<FinanceBank | null>(null);
  const [term, setTerm] = useState('');

  const { hasPermission, isReady } = useCompanyPermissions();
  const canAdmin = isReady && hasPermission('financial', 'admin');

  const handleReload = async () => {
    const { data } = await refetch();
    if (data) toast.success('Dados atualizados com sucesso');
  };

  const handleDelete = (id: string) => {
    swal.fire({
      title: 'Excluir banco?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sim, excluir',
      cancelButtonText: 'Cancelar',
      preConfirm: async () => {
        await mutation.mutateAsync({ type: 'delete', id });
        toast.success('Banco excluído com sucesso');
      },
    });
  };

  const actions: Actions<FinanceBank>[] = [];
  if (canAdmin) {
    actions.push({
      icon: () => <DeleteOutlined />,
      label: () => 'Excluir',
      onClick: (b) => handleDelete(b.id),
    });
  }

  const filtered = (banks ?? []).filter(
    (b) =>
      b.name?.toLowerCase().includes(term.toLowerCase()) ||
      b.code?.toLowerCase().includes(term.toLowerCase()),
  );

  return (
    <>
      <Typography variant="h5" gutterBottom color="primary" fontWeight="bold">
        BANCOS
      </Typography>
      <ListHeader
        onAdd={canAdmin ? () => setOpenModal(true) : undefined}
        onReload={handleReload}
        onSearch={(s) => setTerm(s)}
        searchTitle="Pesquise por nome ou código"
        addTitle="Adicionar banco"
      />
      <Table
        data={filtered}
        columns={columns}
        actions={actions}
        onRowClick={(b) => {
          setSelected(b);
          setOpenModal(true);
        }}
      />
      <FinanceBankDrawer
        open={openModal}
        onClose={() => {
          setOpenModal(false);
          setSelected(null);
        }}
        financeBank={selected}
      />
    </>
  );
};
