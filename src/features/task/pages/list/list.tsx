'use client';

import { Table } from '@/components/common';
import { ListHeader } from '@/components/common/list-header/list-header';
import { TaskDrawer, TaskFilter } from '@/features/task/components';
import TaskCard from '@/features/task/components/task-card/task-card';
import { Task } from '@/features/task/types';
import { formatDate } from '@/utils/date';
import { DeleteOutlined, EditOutlined } from '@mui/icons-material';
import { Box, Chip, Typography } from '@mui/material';
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
    handleFilter,
    viewMode,
    toggleView,
    handleRowClick,
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
        searchTitle="Pesquise por titulo, descrição ou protocolo"
        addTitle="Adicionar tarefa"
        onShowFilters={toggleShowFilter}
        viewMode={viewMode}
        onToggleView={toggleView}
      />

      <TaskFilter
        open={showFilter}
        onFilter={(filter) => handleFilter(filter)}
        loading={false}
      />

      {viewMode === 'table' ? (
        <Table
          columns={columns}
          data={tasks}
          emptyMessage="Nenhum resultado encontrado"
          onReload={handleReload}
          onRowClick={handleRowClick}
          actions={[
            {
              icon: () => <EditOutlined />,
              label: () => 'Editar tarefa',
              onClick: (task) => handleSelectTaskToEdit(task),
            },
            {
              icon: () => <DeleteOutlined />,
              label: () => 'Excluir tarefa',
              onClick: (task) => handleDeleteTask(task.id),
            },
          ]}
        />
      ) : (
        <Box display="flex" flexWrap="wrap" justifyContent="center" gap={2}>
          {tasks && tasks.length > 0 ? (
            tasks.map((t) => (
              <Box
                key={t.id}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  width: { xs: '100%', sm: 'auto' },
                }}
              >
                <TaskCard
                  task={t}
                  onClick={() => handleSelectTaskToEdit(t)}
                  onEdit={() => handleSelectTaskToEdit(t)}
                  onDelete={() => handleDeleteTask(t.id)}
                />
              </Box>
            ))
          ) : (
            <Typography>Nenhum resultado encontrado</Typography>
          )}
        </Box>
      )}

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
