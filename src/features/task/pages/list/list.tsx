'use client';

import { Table } from '@/components/common';
import { ListHeader } from '@/components/common/list-header/list-header';
import { TaskDrawer, TaskFilter } from '@/features/task/components';
import { Task } from '@/features/task/types';
import { formatDate } from '@/utils/date';
import { DeleteOutlined } from '@mui/icons-material';
import { Chip, Typography } from '@mui/material';
import { MRT_ColumnDef } from 'material-react-table';
import { taskStatusLabels } from '../../types/task';
import { useTaskList } from './list.hook';

const columns: MRT_ColumnDef<Task>[] = [
  {
    accessorKey: 'title',
    header: 'Título',
  },
  {
    accessorKey: 'client',
    header: 'Cliente',
    Cell({ cell }: any) {
      return cell.getValue()?.name;
    },
  },
  {
    accessorKey: 'responsible',
    header: 'Responsável',
    Cell({ cell }: any) {
      return cell.getValue()?.name;
    },
  },
  {
    accessorKey: 'type',
    header: 'Tipo',
    Cell({ cell }: any) {
      return cell.getValue()?.name;
    },
  },
  {
    accessorKey: 'date',
    header: 'Data prevista',
    muiTableHeadCellProps: {
      align: 'center',
    },
    muiTableBodyCellProps: {
      align: 'center',
    },
    Cell({ cell }: any) {
      return formatDate(cell.getValue());
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    Cell({ cell }: any) {
      const status = cell.getValue();
      const { label, color } = taskStatusLabels[status] || {
        label: status,
        color: 'default',
      };
      return (
        <Chip
          label={label}
          sx={{ color, borderColor: color }}
          variant="outlined"
          size="small"
        />
      );
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
    showFilter,
    toggleShowFilter,
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
        onShowFilters={toggleShowFilter}
      />

      <TaskFilter open={showFilter} onFilter={console.log} loading={false} />

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
