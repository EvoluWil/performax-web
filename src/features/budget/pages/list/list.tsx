'use client';

import { ListHeader, Table } from '@/components/common';
import { CsvImportModal, useListCsvImport } from '@/components/csv-import';
import { Loading } from '@/components/common/loading/loading';
import { Actions } from '@/components/common/table/table';
import { ApprovalDrawer } from '@/components/drawer/approval-drawer/approval-drawer';
import { PdfPreviewModal } from '@/components/modal';
import { CustomizeColumnsModal } from '@/components/modal/customize-columns/customize-columns.modal';
import { usePdfGenerator } from '@/hooks/common/pdf';
import { useCompanyPermissions } from '@/hooks/common/permission';
import { formatDate } from '@/utils/date';
import {
  DeleteOutlined,
  DownloadOutlined,
  EditOutlined,
  SwapHorizOutlined,
  ThumbsUpDownOutlined,
} from '@mui/icons-material';
import { Box, Button, Chip, Typography } from '@mui/material';
import { MRT_ColumnDef } from 'material-react-table';
import { useCallback, useState } from 'react';
import { createBudgetCsvImportConfig } from '@/features/shared/config/entity-csv-import.configs';
import { BudgetCard } from '../../components/budget-card/budget-card';
import { BudgetDrawer } from '../../components/budget-drawer/budget';
import { BudgetStatusModal } from '../../components/status-modal/status.modal';
import { BudgetFilter } from '../../components/budget-filter/budget-filter';
import {
  Budget,
  BudgetStatusEnum,
  budgetStatusLabels,
  budgetStatusSelectOptions,
} from '../../types/budget';
import { formatBudgetCurrency } from '../../util/currency';
import { useBudgetMutation } from '../../hooks/queries/budgets.query';
import type { BudgetFormDto } from '../../schemas/budget-drawer.schema';
import { useBudgetList } from './list.hook';

const columns: MRT_ColumnDef<Budget>[] = [
  { accessorKey: 'protocol', header: 'Protocolo' },
  { accessorKey: 'title', header: 'Título' },
  {
    accessorKey: 'type',
    header: 'Tipo',
    Cell({ cell }: any) {
      return cell.getValue()?.name ?? '-';
    },
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
    accessorKey: 'description',
    header: 'Descrição',
    Cell({ cell }: any) {
      const value = cell.getValue() as string;
      if (!value) return '-';
      return value.length > 60 ? `${value.slice(0, 60)}...` : value;
    },
  },
  {
    accessorKey: 'observation',
    header: 'Observação',
    Cell({ cell }: any) {
      const value = cell.getValue() as string;
      if (!value) return '-';
      return value.length > 60 ? `${value.slice(0, 60)}...` : value;
    },
  },
  {
    accessorKey: 'value',
    header: 'Valor',

    Cell({ cell }: any) {
      return formatBudgetCurrency(cell.getValue());
    },
  },
  {
    accessorKey: 'createdBy',
    header: 'Criado por',
    Cell({ cell }: any) {
      return cell.getValue()?.name ?? '-';
    },
  },
  {
    accessorKey: 'createdAt',
    header: 'Criado em',
    Cell({ cell }: any) {
      return formatDate(cell.getValue());
    },
  },
  {
    accessorKey: 'updatedAt',
    header: 'Atualizado em',
    Cell({ cell }: any) {
      return formatDate(cell.getValue());
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
      const status = cell.getValue() as BudgetStatusEnum;
      const { label, color } = budgetStatusLabels[status] || {
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

type BudgetReportRow = {
  protocol: string;
  title: string;
  type: string;
  client: string;
  responsible: string;
  description: string;
  observation: string;
  value: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  status: string;
};

export const BudgetList = () => {
  const {
    budgets,
    handleReload,
    handleSearch,
    viewMode,
    toggleView,
    handleRowClick,
    loading,
    showFilter,
    toggleShowFilter,
    handleFilter,
    selectedColumnsKeys,
    toggleCustomizeColumnsModal,
    openCustomizeColumnsModal,
    openModal,
    selectedBudget,
    handleOpenAdd,
    handleCloseAdd,
    handleSelectBudgetToEdit,
    handleDeleteBudget,
    defaultColumns,
    tableKey,
    handleUpdateColumns,
    pagination,
    handlePaginationChange,
    count,
    getBudgetReportData,
    handleApprove,
    handleChangeStatus,
  } = useBudgetList();

  const budgetMutation = useBudgetMutation();

  const handleImportCreate = useCallback(
    (row: BudgetFormDto) =>
      budgetMutation.mutateAsync({ type: 'create', data: row }),
    [budgetMutation],
  );

  const { importOpen, setImportOpen, config: csvImportConfig } =
    useListCsvImport(createBudgetCsvImportConfig, handleImportCreate, [
      handleImportCreate,
    ]);

  const [approvalBudget, setApprovalBudget] = useState<Budget | null>(null);
  const [approvalLoading, setApprovalLoading] = useState(false);
  const [statusBudget, setStatusBudget] = useState<Budget | null>(null);
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
  const canWrite = permissionsReady && hasPermission('budget', 'write');
  const canAdmin = permissionsReady && hasPermission('budget', 'admin');
  const canEdit = canWrite || canAdmin;
  const [generatingPdf, setGeneratingPdf] = useState(false);

  const tableActions: Actions<Budget>[] = [];

  if (canEdit) {
    tableActions.push({
      icon: () => <EditOutlined />,
      label: () => 'Editar orçamento',
      onClick: handleSelectBudgetToEdit,
    });

    tableActions.push({
      icon: () => <SwapHorizOutlined />,
      label: () => 'Alterar status',
      onClick: (row) => setStatusBudget(row),
      condition: (row) => row.approved !== false,
    });
  }

  if (canAdmin) {
    tableActions.push({
      icon: () => <DeleteOutlined />,
      label: () => 'Excluir orçamento',
      onClick: (row) => handleDeleteBudget(row.id),
    });

    tableActions.push({
      icon: () => <ThumbsUpDownOutlined />,
      label: () => 'Aprovar / Reprovar',
      onClick: (row) => setApprovalBudget(row),
      condition: (row) => row.approved === false,
    });
  }

  const columnsToShow = columns.filter((col) =>
    selectedColumnsKeys.includes(col.accessorKey as string),
  );
  const columnsKeys = columns.map((col) => col.accessorKey as string);

  const handleDownloadPdf = async () => {
    setGeneratingPdf(true);

    try {
      const tableHeader = columnsToShow.map((column) => ({
        label: String(column.header ?? column.accessorKey ?? ''),
        value: column.accessorKey as keyof BudgetReportRow,
      }));

      const report = await getBudgetReportData();

      const totalValue = report.budgets.reduce(
        (acc, budget) => acc + Number(budget.value || 0),
        0,
      );

      const formattedTotalValue = formatBudgetCurrency(totalValue);

      const data: BudgetReportRow[] = report.budgets.map((budget) => ({
        protocol: budget.protocol || '-',
        title: budget.title || '-',
        type: budget.type?.name || '-',
        client: budget.client?.name || '-',
        responsible: budget.responsible?.name || '-',
        description: budget.description || '-',
        observation: budget.observation || '-',
        value: formatBudgetCurrency(Number(budget.value || 0)),
        createdBy: budget.createdBy?.name || '-',
        createdAt: formatDate(budget.createdAt) || '-',
        updatedAt: formatDate(budget.updatedAt) || '-',
        status: budget.status
          ? budgetStatusLabels[budget.status]?.label || '-'
          : '-',
      }));

      const subtitleParts = [`Total orçado: ${formattedTotalValue}`];
      if (report.total > report.limit) {
        subtitleParts.push(
          `Relatório limitado a ${report.limit} itens de ${report.total} disponíveis.`,
        );
      }

      await makeTablePDF(
        tableHeader,
        data,
        'Relatório de orçamentos',
        subtitleParts.join(' | '),
      );
    } finally {
      setGeneratingPdf(false);
    }
  };

  return (
    <>
      {loading && <Loading fullScreen message="Carregando orçamentos..." />}

      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        flexWrap="wrap"
        gap={2}
      >
        <Typography variant="h5" gutterBottom color="primary" fontWeight="bold">
          ORÇAMENTOS
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
        addTitle="Adicionar orçamento"
        onShowFilters={toggleShowFilter}
        onToggleView={toggleView}
        viewMode={viewMode}
        onCustomizeColumns={toggleCustomizeColumnsModal}
      />

      <BudgetFilter
        open={showFilter}
        onFilter={(filter) => handleFilter(filter)}
        loading={false}
      />

      {viewMode === 'table' ? (
        <Table
          columns={columnsToShow}
          data={budgets || []}
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
          {budgets && budgets.length > 0 ? (
            budgets.map((budget) => (
              <Box
                key={budget.id}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  width: { xs: '100%', sm: 'auto' },
                }}
              >
                <BudgetCard
                  budget={budget}
                  onClick={() => handleRowClick(budget)}
                  onEdit={
                    canEdit ? () => handleSelectBudgetToEdit(budget) : undefined
                  }
                  onDelete={
                    canAdmin ? () => handleDeleteBudget(budget.id) : undefined
                  }
                  onChangeStatus={
                    canEdit && budget.approved !== false
                      ? () => setStatusBudget(budget)
                      : undefined
                  }
                />
              </Box>
            ))
          ) : (
            <Typography variant="body2" color="text.secondary">
              Nenhum resultado encontrado
            </Typography>
          )}
        </Box>
      )}

      {openModal && (
        <BudgetDrawer
          budget={selectedBudget}
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
        open={!!approvalBudget}
        onClose={() => setApprovalBudget(null)}
        title={approvalBudget?.title}
        loading={approvalLoading}
        onSubmit={async (approved) => {
          if (!approvalBudget) return;
          setApprovalLoading(true);
          await handleApprove(approvalBudget.id, approved);
          setApprovalLoading(false);
          setApprovalBudget(null);
        }}
      />

      {statusBudget && (
        <BudgetStatusModal
          open={!!statusBudget}
          onClose={() => setStatusBudget(null)}
          defaultStatus={statusBudget.status}
          options={budgetStatusSelectOptions}
          onSubmit={async (status) => {
            await handleChangeStatus(statusBudget.id, status);
            setStatusBudget(null);
          }}
        />
      )}

      <CsvImportModal
        open={importOpen}
        onClose={() => setImportOpen(false)}
        config={csvImportConfig}
        onComplete={handleReload}
      />
    </>
  );
};
