'use client';

import { ListHeader, Table } from '@/components/common';
import { Actions } from '@/components/common/table/table';
import { OccurrenceTypeDrawer } from '@/features/occurrence/components';
import { OccurrenceType } from '@/features/occurrence/types';
import { useCompanyPermissions } from '@/hooks/common/permission';
import { DeleteOutlined } from '@mui/icons-material';
import { Typography } from '@mui/material';
import { MRT_ColumnDef } from 'material-react-table';
import { useOccurrenceTypeList } from './type-list.hook';

const columns: MRT_ColumnDef<OccurrenceType>[] = [
  {
    accessorKey: 'name',
    header: 'Nome',
  },
  {
    accessorKey: 'needApprove',
    header: 'Precisa Aprovação?',
    Cell: ({ cell }) => (cell.getValue<boolean>() ? 'Sim' : 'Não'),
  },
];

export const OccurrenceTypeList = () => {
  const {
    occurrenceTypes,
    openModal,
    selectedOccurrenceType,
    handleOpenAdd,
    handleReload,
    handleSearch,
    handleCloseAdd,
    handleDeleteOccurrenceType,
    handleSelectOccurrenceTypeToEdit,
  } = useOccurrenceTypeList();
  const { hasPermission, isReady: permissionsReady } = useCompanyPermissions();
  const canWrite = permissionsReady && hasPermission('occurrence', 'write');
  const canAdmin = permissionsReady && hasPermission('occurrence', 'admin');
  const canEdit = canWrite || canAdmin;

  const actions: Actions<OccurrenceType>[] = [];

  if (canAdmin) {
    actions.push({
      icon: () => <DeleteOutlined />,
      label: () => 'Excluir tipo de ocorrência',
      onClick: (occurrenceType) =>
        handleDeleteOccurrenceType(occurrenceType.id),
    });
  }

  return (
    <>
      <Typography variant="h5" gutterBottom color="primary" fontWeight="bold">
        TIPOS DE OCORRÊNCIA
      </Typography>

      <ListHeader
        onAdd={canEdit ? handleOpenAdd : undefined}
        onReload={handleReload}
        onSearch={handleSearch}
        searchTitle="Pesquise por nome"
        addTitle="Adicionar tipo de ocorrência"
      />
      <br />
      <Table
        columns={columns}
        data={occurrenceTypes}
        emptyMessage="Nenhum resultado encontrado"
        onReload={handleReload}
        onRowClick={canEdit ? handleSelectOccurrenceTypeToEdit : () => null}
        actions={actions}
      />

      {openModal && (
        <OccurrenceTypeDrawer
          occurrenceType={selectedOccurrenceType}
          open={openModal}
          onClose={handleCloseAdd}
        />
      )}
    </>
  );
};
