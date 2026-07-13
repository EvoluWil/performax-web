'use client';

import { Empty, ListHeader, Table } from '@/components/common';
import { CsvImportModal, useListCsvImport } from '@/components/csv-import';
import { Loading } from '@/components/common/loading/loading';
import { Actions } from '@/components/common/table/table';
import { ApprovalDrawer } from '@/components/drawer/approval-drawer/approval-drawer';
import { PdfPreviewModal } from '@/components/modal';
import { CustomizeColumnsModal } from '@/components/modal/customize-columns/customize-columns.modal';
import { TaskCard, TaskDrawer, TaskFilter } from '@/features/task/components';
import { createTaskCsvImportConfig } from '@/features/shared/config/entity-csv-import.configs';
import { useTaskMutation } from '@/features/task/hooks';
import { TaskFormDto } from '@/features/task/schemas';
import { Task, taskStatusLabels } from '@/features/task/types';
import { usePdfGenerator } from '@/hooks/common/pdf';
import { useCompanyPermissions } from '@/hooks/common/permission';
import { formatDate } from '@/utils/date';
import {
  DeleteOutlined,
  DownloadOutlined,
  EditOutlined,
  ThumbsUpDownOutlined,
} from '@mui/icons-material';
import { Box, Button, Chip, Typography } from '@mui/material';
import { MRT_ColumnDef } from 'material-react-table';
import { useCallback, useState } from 'react';
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
    Cell({ cell, row }: any) {
      const approved: boolean = row.original.approved;
      if (approved === false) {
        return (
          <Chip
            label="Aguardando aprovação"
            sx={{ color: 'warning.main', borderColor: 'warning.main' }}
            variant="outlined"
            size="small"
          />
        );
      }
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

type TaskReportRow = {
  title: string;
  protocol: string;
  client: string;
  responsible: string;
  type: string;
  value: string;
  internalNote: string;
  date: string;
  createdAt: string;
  updatedAt: string;
  completedAt: string;
  status: string;
  createdBy: string;
  updatedBy: string;
  files: number;
  conclusionFiles: number;
};

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
    pagination,
    handlePaginationChange,
    count,
    getTaskReportData,
    handleApprove,
  } = useTaskList();

  const taskMutation = useTaskMutation();

  const handleImportCreate = useCallback(
    (row: TaskFormDto) =>
      taskMutation.mutateAsync({ type: 'create', data: row }),
    [taskMutation],
  );

  const { importOpen, setImportOpen, config: csvImportConfig } =
    useListCsvImport(createTaskCsvImportConfig, handleImportCreate, [
      handleImportCreate,
    ]);

  const [approvalTask, setApprovalTask] = useState<Task | null>(null);
  const [approvalLoading, setApprovalLoading] = useState(false);
  const {
    makeTablePDF,
    pdfModalOpen,
    pdfBlobUrl,
    pdfStorageUrl,
    pdfUploading,
    pdfTitle,
    closePdfModal,
    downloadPdf,
  } = usePdfGenerator();
  const { hasPermission, isReady: permissionsReady } = useCompanyPermissions();
  const canWrite = permissionsReady && hasPermission('task', 'write');
  const canAdmin = permissionsReady && hasPermission('task', 'admin');
  const canEdit = canWrite || canAdmin;
  const [generatingPdf, setGeneratingPdf] = useState(false);

  const tableActions: Actions<Task>[] = [];

  if (canEdit) {
    tableActions.push({
      icon: () => <EditOutlined />,
      label: () => 'Editar OS',
      onClick: (task) => handleSelectTaskToEdit(task),
    });
  }

  if (canAdmin) {
    tableActions.push({
      icon: () => <DeleteOutlined />,
      label: () => 'Excluir OS',
      onClick: (task) => handleDeleteTask(task.id),
    });

    tableActions.push({
      icon: () => <ThumbsUpDownOutlined />,
      label: () => 'Aprovar / Reprovar',
      onClick: (task) => setApprovalTask(task),
      condition: (task) => task.approved === false,
    });
  }

  const columnsToShow = columns.filter((col) =>
    selectedColumnsKeys.includes(col.accessorKey as string),
  );

  const handleDownloadPdf = async () => {
    setGeneratingPdf(true);

    try {
      const tableHeader = columnsToShow.map((column) => ({
        label: String(column.header ?? column.accessorKey ?? ''),
        value: column.accessorKey as keyof TaskReportRow,
      }));

      const report = await getTaskReportData();

      const totalValue = report.tasks.reduce(
        (acc, task) => acc + Number(task.value || 0),
        0,
      );

      const formattedTotalValue = Intl.NumberFormat('pt-BR', {
        currency: 'BRL',
        style: 'currency',
      }).format(totalValue);

      const data: TaskReportRow[] = report.tasks.map((task) => ({
        title: task.title || '-',
        protocol: task.protocol || '-',
        client: task.client?.name || '-',
        responsible: task.responsible?.name || '-',
        type: task.type?.name || '-',
        value:
          Number(task.value || 0) > 0
            ? Number(task.value || 0).toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              })
            : '-',
        internalNote: task.internalNote || '-',
        date: formatDate(task.date) || '-',
        createdAt: formatDate(task.createdAt) || '-',
        updatedAt: formatDate(task.updatedAt) || '-',
        completedAt: task.completedAt ? formatDate(task.completedAt) : '-',
        status: task.status ? taskStatusLabels[task.status]?.label || '-' : '-',
        createdBy: task.createdBy?.name || '-',
        updatedBy: task.updatedBy?.name || '-',
        files: task.files?.length || 0,
        conclusionFiles: task.conclusionFiles?.length || 0,
      }));

      const subtitleParts = [`Valor total: ${formattedTotalValue}`];
      if (report.total > report.limit) {
        subtitleParts.push(
          `Relatório limitado a ${report.limit} itens de ${report.total} disponíveis.`,
        );
      }

      await makeTablePDF(
        tableHeader,
        data,
        'Relatório de OS',
        subtitleParts.join(' | '),
      );
    } finally {
      setGeneratingPdf(false);
    }
  };

  return (
    <>
      {loading && (
        <Loading fullScreen message="Carregando ordens de serviço..." />
      )}

      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        flexWrap="wrap"
        gap={2}
      >
        <Typography variant="h5" gutterBottom color="primary" fontWeight="bold">
          ORDENS DE SERVIÇO
        </Typography>
        <Button
          variant="contained"
          onClick={handleDownloadPdf}
          startIcon={<DownloadOutlined />}
          disabled={!count || generatingPdf}
        >
          Baixar PDF
        </Button>
      </Box>

      <ListHeader
        onAdd={canEdit ? handleOpenAdd : undefined}
        onImport={canEdit ? () => setImportOpen(true) : undefined}
        onReload={handleReload}
        onSearch={handleSearch}
        searchTitle="Pesquise por título, descrição, protocolo ou cliente"
        addTitle="Adicionar OS"
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
          pagination={pagination}
          onPaginationChange={handlePaginationChange}
          rowCount={count}
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
          columns={columns.map((col) => ({
            key: col.accessorKey as string,
            label: String(col.header),
          }))}
          tableKey={tableKey}
          defaultColumns={defaultColumns}
        />
      )}

      <PdfPreviewModal
        open={pdfModalOpen}
        onClose={closePdfModal}
        pdfBlobUrl={pdfBlobUrl}
        pdfStorageUrl={pdfStorageUrl}
        pdfUploading={pdfUploading}
        title={pdfTitle}
        onDownload={downloadPdf}
      />

      <ApprovalDrawer
        open={!!approvalTask}
        onClose={() => setApprovalTask(null)}
        title={approvalTask?.title}
        loading={approvalLoading}
        onSubmit={async (approved) => {
          if (!approvalTask) return;
          setApprovalLoading(true);
          await handleApprove(approvalTask.id, approved);
          setApprovalLoading(false);
          setApprovalTask(null);
        }}
      />

      <CsvImportModal
        open={importOpen}
        onClose={() => setImportOpen(false)}
        config={csvImportConfig}
        onComplete={handleReload}
      />
    </>
  );
};
