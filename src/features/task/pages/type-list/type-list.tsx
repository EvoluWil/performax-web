'use client';

import { Table } from '@/components/common';
import { ListHeader } from '@/components/common/list-header/list-header';
import { TaskTypeDrawer } from '@/features/task/components';
import { TaskType } from '@/features/task/types';
import { DeleteOutlined } from '@mui/icons-material';
import { Typography } from '@mui/material';
import { MRT_ColumnDef } from 'material-react-table';
import { useTaskTypeList } from './type-list.hook';

const columns: MRT_ColumnDef<TaskType>[] = [
  {
    accessorKey: 'name',
    header: 'Nome',
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

  return (
    <>
      <Typography variant="h5" gutterBottom color="primary" fontWeight="bold">
        TIPOS DE TAREFA
      </Typography>

      <ListHeader
        onAdd={handleOpenAdd}
        onReload={handleReload}
        onSearch={handleSearch}
        searchTitle="Pesquise por nome"
        addTitle="Adicionar tipo de tarefa"
      />
      <br />
      <Table
        columns={columns}
        data={taskTypes}
        emptyMessage="Nenhum resultado encontrado"
        onReload={handleReload}
        onRowClick={handleSelectTaskTypeToEdit}
        actions={[
          {
            icon: () => <DeleteOutlined />,
            label: () => 'Excluir tipo de tarefa',
            onClick: (taskType) => handleDeleteTaskType(taskType.id),
          },
        ]}
      />

      {openModal && (
        <TaskTypeDrawer
          taskType={selectedTaskType}
          open={openModal}
          onClose={handleCloseAdd}
        />
      )}
    </>
  );
};
