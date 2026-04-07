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
import { FinanceTypeDrawer } from '../../components/finance-type-drawer/finance-type-drawer';
import {
  useFinanceTypeMutation,
  useFinanceTypesQuery,
} from '../../hooks/queries/finance-types.query';
import type { FinanceType } from '../../types/finance-type';

const columns: MRT_ColumnDef<FinanceType>[] = [
  { accessorKey: 'name', header: 'Nome' },
  {
    accessorKey: 'needApprove',
    header: 'Precisa Aprovação?',
    Cell: ({ cell }) => (cell.getValue<boolean>() ? 'Sim' : 'Não'),
  },
];

export const FinanceTypeList = () => {
  const { data: financeTypes, refetch } = useFinanceTypesQuery();
  const mutation = useFinanceTypeMutation();
  const [openModal, setOpenModal] = useState(false);
  const [selected, setSelected] = useState<FinanceType | null>(null);
  const [term, setTerm] = useState('');

  const { hasPermission, isReady } = useCompanyPermissions();
  const canAdmin = isReady && hasPermission('financial', 'admin');

  const handleReload = async () => {
    const { data } = await refetch();
    if (data) toast.success('Dados atualizados com sucesso');
  };

  const handleSearch = (search: string) => setTerm(search);

  const handleDelete = (id: string) => {
    swal.fire({
      title: 'Excluir centro de custo?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sim, excluir',
      cancelButtonText: 'Cancelar',
      preConfirm: async () => {
        await mutation.mutateAsync({ type: 'delete', id });
        toast.success('Centro de custo excluído com sucesso');
      },
    });
  };

  const actions: Actions<FinanceType>[] = [];
  if (canAdmin) {
    actions.push({
      icon: () => <DeleteOutlined />,
      label: () => 'Excluir',
      onClick: (t) => handleDelete(t.id),
    });
  }

  const filtered = (financeTypes ?? []).filter((t) =>
    t.name?.toLowerCase().includes(term.toLowerCase()),
  );

  return (
    <>
      <Typography variant="h5" gutterBottom color="primary" fontWeight="bold">
        CENTROS DE CUSTO
      </Typography>
      <ListHeader
        onAdd={canAdmin ? () => setOpenModal(true) : undefined}
        onReload={handleReload}
        onSearch={handleSearch}
        searchTitle="Pesquise por nome"
        addTitle="Adicionar centro de custo"
      />
      <Table
        data={filtered}
        columns={columns}
        actions={actions}
        onRowClick={(t) => {
          setSelected(t);
          setOpenModal(true);
        }}
      />
      <FinanceTypeDrawer
        open={openModal}
        onClose={() => {
          setOpenModal(false);
          setSelected(null);
        }}
        financeType={selected}
      />
    </>
  );
};
