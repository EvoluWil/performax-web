'use client';

import { ListHeader, Table } from '@/components/common';
import { Loading } from '@/components/common/loading/loading';
import { Actions } from '@/components/common/table/table';
import { PdfPreviewModal } from '@/components/modal';
import { CustomizeColumnsModal } from '@/components/modal/customize-columns/customize-columns.modal';
import { usePdfGenerator } from '@/hooks/common/pdf';
import { useCompanyPermissions } from '@/hooks/common/permission';
import { formatDate } from '@/utils/date';
import {
  DeleteOutlined,
  DownloadOutlined,
  EditOutlined,
} from '@mui/icons-material';
import { Box, Button, Chip, Typography } from '@mui/material';
import { MRT_ColumnDef } from 'material-react-table';
import { useState } from 'react';
import { BudgetCard } from '../../components/budget-card/budget-card';
import { BudgetDrawer } from '../../components/budget-drawer/budget';
import { BudgetFilter } from '../../components/budget-filter/budget-filter';
import {
  Budget,
  BudgetStatusEnum,
  budgetStatusLabels,
} from '../../types/budget';
import { useBudgetList } from './list.hook';

const columns: MRT_ColumnDef<Budget>[] = [
  { accessorKey: 'protocol', header: 'Protocolo' },
  { accessorKey: 'title', header: 'Título' },
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
    accessorKey: 'value',
    header: 'Valor',

    Cell({ cell }: any) {
      return Number(cell.getValue()).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      });
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
    accessorKey: 'status',
    header: 'Status',
    Cell({ cell }: any) {
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
  client: string;
  responsible: string;
  value: string;
  createdAt: string;
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
  } = useBudgetList();
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
  }

  if (canAdmin) {
    tableActions.push({
      icon: () => <DeleteOutlined />,
      label: () => 'Excluir orçamento',
      onClick: (row) => handleDeleteBudget(row.id),
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

      const formattedTotalValue = Intl.NumberFormat('pt-BR', {
        currency: 'BRL',
        style: 'currency',
      }).format(totalValue);

      const data: BudgetReportRow[] = report.budgets.map((budget) => ({
        protocol: budget.protocol || '-',
        title: budget.title || '-',
        client: budget.client?.name || '-',
        responsible: budget.responsible?.name || '-',
        value: Number(budget.value || 0).toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        }),
        createdAt: formatDate(budget.createdAt) || '-',
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
        onReload={handleReload}
        onSearch={handleSearch}
        searchTitle="Pesquise por título, descrição ou protocolo"
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
          columns={columnsKeys}
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
    </>
  );
};
