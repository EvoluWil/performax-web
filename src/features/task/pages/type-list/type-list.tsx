'use client';

import { ListHeader, Table } from '@/components/common';
import { CsvImportModal, useListCsvImport } from '@/components/csv-import';
import { Actions } from '@/components/common/table/table';
import { TaskTypeDrawer } from '@/features/task/components';
import { createTaskTypeCsvImportConfig } from '@/features/shared/config/type-csv-import.configs';
import { useTaskTypeMutation } from '@/features/task/hooks';
import { TaskTypeFormDto } from '@/features/task/schemas/task-type-drawer.schema';
import { TaskType } from '@/features/task/types';
import { useCompanyPermissions } from '@/hooks/common/permission';
import { DeleteOutlined } from '@mui/icons-material';
import { Typography } from '@mui/material';
import { MRT_ColumnDef } from 'material-react-table';
import { useCallback } from 'react';
import { useTaskTypeList } from './type-list.hook';

const columns: MRT_ColumnDef<TaskType>[] = [
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

export const TaskTypeList = () => {
  const {
    taskTypes,
    openModal,
    selectedTaskType,
    handleOpenAdd,
    handleReload,
    handleSearch,
    handleCloseAdd,
    handleDeleteTaskType,
    handleSelectTaskTypeToEdit,
  } = useTaskTypeList();
  const taskTypeMutation = useTaskTypeMutation();

  const handleCreate = useCallback(
    (row: TaskTypeFormDto) =>
      taskTypeMutation.mutateAsync({ type: 'create', data: row }),
    [taskTypeMutation],
  );

  const { importOpen, setImportOpen, config } = useListCsvImport(
    createTaskTypeCsvImportConfig,
    handleCreate,
    [handleCreate],
  );

  const { hasPermission, isReady: permissionsReady } = useCompanyPermissions();
  const canWrite = permissionsReady && hasPermission('task', 'write');
  const canAdmin = permissionsReady && hasPermission('task', 'admin');
  const canEdit = canWrite || canAdmin;

  const actions: Actions<TaskType>[] = [];

  if (canAdmin) {
    actions.push({
      icon: () => <DeleteOutlined />,
      label: () => 'Excluir tipo de OS',
      onClick: (taskType) => handleDeleteTaskType(taskType.id),
    });
  }

  return (
    <>
      <Typography variant="h5" gutterBottom color="primary" fontWeight="bold">
        TIPOS DE OS
      </Typography>

      <ListHeader
        onAdd={canEdit ? handleOpenAdd : undefined}
        onImport={canEdit ? () => setImportOpen(true) : undefined}
        onReload={handleReload}
        onSearch={handleSearch}
        searchTitle="Pesquise por nome"
        addTitle="Adicionar tipo de OS"
      />
      <br />
      <Table
        columns={columns}
        data={taskTypes}
        emptyMessage="Nenhum resultado encontrado"
        onReload={handleReload}
        onRowClick={canEdit ? handleSelectTaskTypeToEdit : () => null}
        actions={actions}
      />

      {openModal && (
        <TaskTypeDrawer
          taskType={selectedTaskType}
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
