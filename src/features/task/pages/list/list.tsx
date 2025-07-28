'use client';

import { Table } from '@/components/common';
import { ListHeader } from '@/components/common/list-header/list-header';
import { TaskDrawer } from '@/features/task/components';
import { Task } from '@/features/task/types';
import { formatCnpj } from '@/utils/cnpj';
import { DeleteOutlined } from '@mui/icons-material';
import { Typography } from '@mui/material';
import { MRT_ColumnDef } from 'material-react-table';
import { useTaskList } from './list.hook';

const columns: MRT_ColumnDef<Task>[] = [
  {
    accessorKey: 'name',
    header: 'Nome',
  },
  {
    accessorKey: 'address',
    header: 'Endereço',
  },
  {
    accessorKey: 'cnpj',
    header: 'CNPJ',
    muiTableHeadCellProps: {
      align: 'center',
    },
    muiTableBodyCellProps: {
      align: 'center',
    },
    Cell({ cell }: any) {
      return formatCnpj(cell.getValue());
    },
  },
];

export const TaskList = () => {
  const {
    tasks,
    openModal,
    selectedTask,
    handleOpenAdd,
    handleReload,
    handleSearch,
    handleCloseAdd,
    handleDeleteTask,
    handleSelectTaskToEdit,
  } = useTaskList();

  return (
    <>
      <Typography variant="h5" gutterBottom color="primary" fontWeight="bold">
        TAREFAS
      </Typography>

      <ListHeader
        onAdd={handleOpenAdd}
        onReload={handleReload}
        onSearch={handleSearch}
        searchTitle="Pesquise por nome, CNPJ ou endereço"
        addTitle="Adicionar tarefa"
      />
      <br />
      <Table
        columns={columns}
        data={tasks}
        emptyMessage="Nenhum resultado encontrado"
        onReload={handleReload}
        onRowClick={handleSelectTaskToEdit}
        actions={[
          {
            icon: () => <DeleteOutlined />,
            label: () => 'Excluir tarefa',
            onClick: (task) => handleDeleteTask(task.id),
          },
        ]}
      />

      {openModal && (
        <TaskDrawer
          task={selectedTask}
          open={openModal}
          onClose={handleCloseAdd}
        />
      )}
    </>
  );
};
