'use client';

import { ListHeader, Table } from '@/components/common';
import { CsvImportModal, useListCsvImport } from '@/components/csv-import';
import { Actions } from '@/components/common/table/table';
import { useCompanyPermissions } from '@/hooks/common/permission';
import { createContractTypeCsvImportConfig } from '@/features/shared/config/type-csv-import.configs';
import { formatDate } from '@/utils/date';
import { DeleteOutlined, TrendingUpOutlined } from '@mui/icons-material';
import { Typography } from '@mui/material';
import { MRT_ColumnDef } from 'material-react-table';
import { useCallback, useState } from 'react';
import { ContractTypeAdjustmentModal } from '../../components/contract-type-adjustment-modal/contract-type-adjustment-modal';
import { ContractTypeDrawer } from '../../components/contract-type-drawer/contract-type';
import { useContractTypeMutation } from '../../hooks/queries/contract-types.query';
import { ContractTypeFormDto } from '../../schemas/contract-type.schema';
import { ContractType } from '../../types/contract-type';
import { useContractTypeList } from './type-list.hook';

const columns: MRT_ColumnDef<ContractType>[] = [
  { accessorKey: 'name', header: 'Nome' },
  {
    accessorKey: 'lastAdjustmentPercentage',
    header: 'Último reajuste',
    Cell: ({ cell }) => {
      const value = cell.getValue<number | null>();
      if (value == null) return '-';
      return `${value}%`;
    },
  },
  {
    accessorKey: 'lastAdjustmentAt',
    header: 'Data do reajuste',
    Cell: ({ cell }) => {
      const value = cell.getValue<string | Date | null>();
      return value ? formatDate(value) : '-';
    },
  },
];

export const ContractTypeList = () => {
  const {
    contractTypes,
    openModal,
    selectedContractType,
    handleOpenAdd,
    handleReload,
    handleSearch,
    handleCloseAdd,
    handleDeleteContractType,
    handleSelectContractTypeToEdit,
  } = useContractTypeList();

  const [adjustmentTarget, setAdjustmentTarget] =
    useState<ContractType | null>(null);
  const contractTypeMutation = useContractTypeMutation();

  const handleCreate = useCallback(
    (row: ContractTypeFormDto) =>
      contractTypeMutation.mutateAsync({ type: 'create', data: row }),
    [contractTypeMutation],
  );

  const { importOpen, setImportOpen, config } = useListCsvImport(
    createContractTypeCsvImportConfig,
    handleCreate,
    [handleCreate],
  );

  const { hasPermission, isReady: permissionsReady } = useCompanyPermissions();
  const canWrite = permissionsReady && hasPermission('client', 'write');
  const canAdmin = permissionsReady && hasPermission('client', 'admin');
  const canEdit = canWrite || canAdmin;

  const actions: Actions<ContractType>[] = [];

  if (canEdit) {
    actions.push({
      icon: () => <TrendingUpOutlined />,
      label: () => 'Aplicar reajuste',
      onClick: (type) => setAdjustmentTarget(type),
    });
  }

  if (canAdmin) {
    actions.push({
      icon: () => <DeleteOutlined />,
      label: () => 'Excluir tipo de contrato',
      onClick: (type) => handleDeleteContractType(type.id),
    });
  }

  return (
    <>
      <Typography variant="h5" gutterBottom color="primary" fontWeight="bold">
        TIPOS DE CONTRATO
      </Typography>

      <ListHeader
        onAdd={canEdit ? handleOpenAdd : undefined}
        onImport={canEdit ? () => setImportOpen(true) : undefined}
        onReload={handleReload}
        onSearch={handleSearch}
        searchTitle="Pesquise por nome"
        addTitle="Adicionar tipo de contrato"
      />
      <br />
      <Table
        columns={columns}
        data={contractTypes || []}
        emptyMessage="Nenhum resultado encontrado"
        onReload={handleReload}
        onRowClick={canEdit ? handleSelectContractTypeToEdit : () => null}
        actions={actions}
      />

      {openModal && (
        <ContractTypeDrawer
          contractType={selectedContractType}
          open={openModal}
          onClose={handleCloseAdd}
        />
      )}

      {adjustmentTarget && (
        <ContractTypeAdjustmentModal
          open={!!adjustmentTarget}
          onClose={() => setAdjustmentTarget(null)}
          contractType={adjustmentTarget}
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
