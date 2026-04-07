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
import { FinancePaymentMethodDrawer } from '../../components/finance-payment-method-drawer/finance-payment-method-drawer';
import {
  useFinancePaymentMethodMutation,
  useFinancePaymentMethodsQuery,
} from '../../hooks/queries/finance-payment-methods.query';
import type { FinancePaymentMethod } from '../../types/finance-payment-method';

const columns: MRT_ColumnDef<FinancePaymentMethod>[] = [
  { accessorKey: 'name', header: 'Nome' },
];

export const FinancePaymentMethodList = () => {
  const { data: methods, refetch } = useFinancePaymentMethodsQuery();
  const mutation = useFinancePaymentMethodMutation();
  const [openModal, setOpenModal] = useState(false);
  const [selected, setSelected] = useState<FinancePaymentMethod | null>(null);
  const [term, setTerm] = useState('');

  const { hasPermission, isReady } = useCompanyPermissions();
  const canAdmin = isReady && hasPermission('financial', 'admin');

  const handleReload = async () => {
    const { data } = await refetch();
    if (data) toast.success('Dados atualizados com sucesso');
  };

  const handleDelete = (id: string) => {
    swal.fire({
      title: 'Excluir método de pagamento?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sim, excluir',
      cancelButtonText: 'Cancelar',
      preConfirm: async () => {
        await mutation.mutateAsync({ type: 'delete', id });
        toast.success('Método excluído com sucesso');
      },
    });
  };

  const actions: Actions<FinancePaymentMethod>[] = [];
  if (canAdmin) {
    actions.push({
      icon: () => <DeleteOutlined />,
      label: () => 'Excluir',
      onClick: (m) => handleDelete(m.id),
    });
  }

  const filtered = (methods ?? []).filter((m) =>
    m.name?.toLowerCase().includes(term.toLowerCase()),
  );

  return (
    <>
      <Typography variant="h5" gutterBottom color="primary" fontWeight="bold">
        MÉTODOS DE PAGAMENTO
      </Typography>
      <ListHeader
        onAdd={canAdmin ? () => setOpenModal(true) : undefined}
        onReload={handleReload}
        onSearch={(s) => setTerm(s)}
        searchTitle="Pesquise por nome"
        addTitle="Adicionar método de pagamento"
      />
      <Table
        data={filtered}
        columns={columns}
        actions={actions}
        onRowClick={(m) => {
          setSelected(m);
          setOpenModal(true);
        }}
      />
      <FinancePaymentMethodDrawer
        open={openModal}
        onClose={() => {
          setOpenModal(false);
          setSelected(null);
        }}
        financePaymentMethod={selected}
      />
    </>
  );
};
