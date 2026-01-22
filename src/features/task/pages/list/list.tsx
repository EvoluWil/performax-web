'use client';

import { Empty, ListHeader, Table } from '@/components/common';
import { Loading } from '@/components/common/loading/loading';
import { Actions } from '@/components/common/table/table';
import { CustomizeColumnsModal } from '@/components/modal/customize-columns/customize-columns.modal';
import { TaskCard, TaskDrawer, TaskFilter } from '@/features/task/components';
import { Task, taskStatusLabels } from '@/features/task/types';
import { useCompanyPermissions } from '@/hooks/common/permission';
import { formatDate } from '@/utils/date';
import { DeleteOutlined, EditOutlined } from '@mui/icons-material';
import { Box, Chip, Typography } from '@mui/material';
import { MRT_ColumnDef } from 'material-react-table';
import { useTaskList } from './list.hook';

const columns: MRT_ColumnDef<Task>[] = [
  {
    accessorKey: 'title',
    header: 'Título',
  },
  {
    accessorKey: 'protocol',
    header: 'Protocolo',
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
    accessorKey: 'value',
    header: 'Valor',
    muiTableHeadCellProps: {
      align: 'right',
    },
    muiTableBodyCellProps: {
      align: 'right',
    },
    Cell({ cell }: any) {
      const value = cell.getValue();
      if (!value || value === 0) return '-';
      return value.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      });
    },
  },
  {
    accessorKey: 'internalNote',
    header: 'Obs. Interna',
    Cell({ cell }: any) {
      const v = cell.getValue();
      if (!v) return '';
      return typeof v === 'string' && v.length > 60
        ? `${v.slice(0, 60)}...`
        : v;
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
    accessorKey: 'createdAt',
    header: 'Criada em',
    Cell({ cell }: any) {
      return formatDate(cell.getValue());
    },
  },
  {
    accessorKey: 'updatedAt',
    header: 'Atualizada em',
    Cell({ cell }: any) {
      return formatDate(cell.getValue());
    },
  },
  {
    accessorKey: 'completedAt',
    header: 'Concluída em',
    Cell({ cell }: any) {
      return cell.getValue() ? formatDate(cell.getValue()) : '-';
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
  {
    accessorKey: 'createdBy',
    header: 'Criada por',
    Cell({ cell }: any) {
      return cell.getValue()?.name ?? '-';
    },
  },
  {
    accessorKey: 'updatedBy',
    header: 'Atualizada por',
    Cell({ cell }: any) {
      return cell.getValue()?.name ?? '-';
    },
  },
  {
    accessorKey: 'files',
    header: 'Anexos',
    Cell({ cell }: any) {
      const v = cell.getValue();
      return v ? v.length : 0;
    },
  },
  {
    accessorKey: 'conclusionFiles',
    header: 'Anexos (Conclusão)',
    Cell({ cell }: any) {
      const v = cell.getValue();
      return v ? v.length : 0;
    },
  },
];

const columnsKeys = columns.map((col) => col.accessorKey as string);

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
    loading,
    filterLoading,
    toggleCustomizeColumnsModal,
    openCustomizeColumnsModal,
    handleUpdateColumns,
    selectedColumnsKeys,
    defaultColumns,
    tableKey,
  } = useTaskList();
  const { hasPermission, isReady: permissionsReady } = useCompanyPermissions();
  const canWrite = permissionsReady && hasPermission('task', 'write');
  const canAdmin = permissionsReady && hasPermission('task', 'admin');
  const canEdit = canWrite || canAdmin;

  const tableActions: Actions<Task>[] = [];

  if (canEdit) {
    tableActions.push({
      icon: () => <EditOutlined />,
      label: () => 'Editar tarefa',
      onClick: (task) => handleSelectTaskToEdit(task),
    });
  }

  if (canAdmin) {
    tableActions.push({
      icon: () => <DeleteOutlined />,
      label: () => 'Excluir tarefa',
      onClick: (task) => handleDeleteTask(task.id),
    });
  }

  const columnsToShow = columns.filter((col) =>
    selectedColumnsKeys.includes(col.accessorKey as string),
  );

  return (
    <>
      {loading && <Loading fullScreen message="Carregando tarefas..." />}

      <Typography variant="h5" gutterBottom color="primary" fontWeight="bold">
        TAREFAS
      </Typography>

      <ListHeader
        onAdd={canEdit ? handleOpenAdd : undefined}
        onReload={handleReload}
        onSearch={handleSearch}
        searchTitle="Pesquise por titulo, descrição ou protocolo"
        addTitle="Adicionar tarefa"
        onShowFilters={toggleShowFilter}
        viewMode={viewMode}
        onToggleView={toggleView}
        onCustomizeColumns={toggleCustomizeColumnsModal}
      />

      <TaskFilter
        open={showFilter}
        onFilter={(filter) => handleFilter(filter)}
        loading={filterLoading}
      />

      {viewMode === 'table' ? (
        <Table
          columns={columnsToShow}
          data={tasks}
          emptyMessage="Nenhum resultado encontrado"
          onReload={handleReload}
          onRowClick={handleRowClick}
          loading={loading}
          actions={tableActions}
        />
      ) : (
        <Box display="flex" flexWrap="wrap" justifyContent="center" gap={2}>
          {tasks && tasks.length > 0 ? (
            tasks.map((task) => (
              <Box
                key={task.id}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  width: { xs: '100%', sm: 'auto' },
                }}
              >
                <TaskCard
                  task={task}
                  onClick={() => handleRowClick(task)}
                  onEdit={
                    canEdit ? () => handleSelectTaskToEdit(task) : undefined
                  }
                  onDelete={
                    canAdmin ? () => handleDeleteTask(task.id) : undefined
                  }
                />
              </Box>
            ))
          ) : (
            <Empty
              message="Nenhum resultado encontrado"
              onReload={handleReload}
            />
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

      {openCustomizeColumnsModal && (
        <CustomizeColumnsModal
          open={openCustomizeColumnsModal}
          onClose={toggleCustomizeColumnsModal}
          onSuccess={handleUpdateColumns}
          columns={columnsKeys}
          tableKey={tableKey}
          defaultColumns={defaultColumns}
        />
      )}
    </>
  );
};
