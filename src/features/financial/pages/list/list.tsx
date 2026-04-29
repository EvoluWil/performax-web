'use client';

import { Empty, ListHeader, Table } from '@/components/common';
import { Loading } from '@/components/common/loading/loading';
import { Actions } from '@/components/common/table/table';
import { ApprovalDrawer } from '@/components/drawer/approval-drawer/approval-drawer';
import { CurrencyInput } from '@/components/inputs';
import { PdfPreviewModal } from '@/components/modal';
import { CustomizeColumnsModal } from '@/components/modal/customize-columns/customize-columns.modal';
import { usePdfGenerator } from '@/hooks/common/pdf';
import { useCompanyPermissions } from '@/hooks/common/permission';
import { formatDate } from '@/utils/date';
import {
  AccountBalanceWalletOutlined,
  CheckCircleOutlined,
  CompareArrowsOutlined,
  DeleteOutlined,
  DownloadOutlined,
  EditOutlined,
  RefreshOutlined,
  ThumbsUpDownOutlined,
  UndoOutlined,
} from '@mui/icons-material';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Tooltip,
  Typography,
} from '@mui/material';
import { MRT_ColumnDef } from 'material-react-table';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { CompanyTransferModal } from '../../components/company-transfer-modal/company-transfer-modal';
import { FinanceCard } from '../../components/finance-card/finance-card';
import { FinanceDrawer } from '../../components/finance-drawer/finance-drawer';
import { FinanceFilter } from '../../components/finance-filter/finance-filter';
import { MarkAsPaidModal } from '../../components/mark-as-paid-modal/mark-as-paid-modal';
import {
  useFinanceApprovalMutation,
  useFinanceMutation,
} from '../../hooks/queries/finances.query';
import {
  Finance,
  FinanceFlowEnum,
  FinanceStatusEnum,
  financeFlowLabels,
  financeStatusLabels,
} from '../../types/finance';
import { defaultColumns, useFinanceList } from './list.hook';

type FinanceReportRow = {
  protocol: string;
  title: string;
  flow: string;
  value: string;
  tax: string;
  retention: string;
  date: string;
  paymentDate: string;
  bank: string;
  method: string;
  type: string;
  category: string;
  client: string;
  employee: string;
  payee: string;
  createdBy: string;
  status: string;
};

const columns: MRT_ColumnDef<Finance>[] = [
  { accessorKey: 'protocol', header: 'Protocolo' },
  { accessorKey: 'title', header: 'Título' },
  {
    accessorKey: 'type',
    header: 'Centro de Custo',
    Cell({ cell }: any) {
      return cell.getValue()?.name ?? '-';
    },
  },
  {
    accessorKey: 'flow',
    header: 'Fluxo',
    Cell({ cell }: any) {
      const flow = cell.getValue() as FinanceFlowEnum;
      const meta = financeFlowLabels[flow] || { label: flow, color: 'default' };
      return (
        <Chip
          label={meta.label}
          size="small"
          sx={{ color: meta.color, borderColor: meta.color }}
          variant="outlined"
        />
      );
    },
  },
  {
    accessorKey: 'value',
    header: 'Valor',
    Cell({ cell }: any) {
      return Number(cell.getValue() / 100).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      });
    },
  },
  {
    accessorKey: 'date',
    header: 'Data',
    Cell({ cell }: any) {
      return formatDate(cell.getValue());
    },
  },
  {
    accessorKey: 'paymentDate',
    header: 'Data de Pagamento',
    Cell({ cell }: any) {
      return cell.getValue() ? formatDate(cell.getValue()) : '-';
    },
  },
  {
    accessorKey: 'tax',
    header: 'Impostos',
    Cell({ cell }: any) {
      const v = cell.getValue();
      return v != null
        ? Number(v / 100).toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL',
          })
        : '-';
    },
  },
  {
    accessorKey: 'retention',
    header: 'Retenção',
    Cell({ cell }: any) {
      const v = cell.getValue();
      return v != null
        ? Number(v / 100).toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL',
          })
        : '-';
    },
  },
  {
    accessorKey: 'bank',
    header: 'Banco',
    Cell({ cell }: any) {
      return cell.getValue()?.name ?? '-';
    },
  },
  {
    accessorKey: 'method',
    header: 'Método',
    Cell({ cell }: any) {
      return cell.getValue()?.name ?? '-';
    },
  },
  {
    accessorKey: 'category',
    header: 'Categoria',
    Cell({ cell }: any) {
      return cell.getValue()?.name ?? '-';
    },
  },
  {
    accessorKey: 'client',
    header: 'Cliente',
    Cell({ cell }: any) {
      return cell.getValue()?.name ?? '-';
    },
  },
  {
    accessorKey: 'employee',
    header: 'Funcionário',
    Cell({ cell }: any) {
      return cell.getValue()?.name ?? '-';
    },
  },
  {
    accessorKey: 'payee',
    header: 'Favorecido',
    Cell({ cell }: any) {
      return cell.getValue()?.name ?? '-';
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
      const status = cell.getValue() as FinanceStatusEnum;
      const isLate =
        status === FinanceStatusEnum.PAID &&
        row.original.paymentDate &&
        row.original.date &&
        new Date(row.original.paymentDate) > new Date(row.original.date);
      if (isLate) {
        return (
          <Chip
            label="Pago em atraso"
            sx={{ color: 'orange', borderColor: 'orange' }}
            variant="outlined"
            size="small"
          />
        );
      }
      const meta = financeStatusLabels[status] || {
        label: status,
        color: 'default',
      };
      return (
        <Chip
          label={meta.label}
          sx={{ color: meta.color, borderColor: meta.color }}
          variant="outlined"
          size="small"
        />
      );
    },
  },
];

export const FinanceList = () => {
  const {
    finances,
    count,
    handleReload,
    handleSearch,
    handleRowClick,
    handleOpenAdd,
    handleCloseAdd,
    handleSelectFinanceToEdit,
    handleDeleteFinance,
    toggleShowFilter,
    handleFilter,
    handleRecalculate,
    openModal,
    selectedFinance,
    showFilter,
    loading,
    wallet,
    walletRecalculating,
    walletUpdating,
    openWalletEditModal,
    setOpenWalletEditModal,
    handleWalletUpdate,
    openTransferModal,
    setOpenTransferModal,
    pagination,
    setPagination,
    currentCompanyId,
    groupId,
    viewMode,
    toggleView,
    openCustomizeColumnsModal,
    toggleCustomizeColumnsModal,
    selectedColumnsKeys,
    handleUpdateColumns,
    tableKey,
    getFinanceReportData,
  } = useFinanceList();

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

  const columnsToShow = columns.filter((col) =>
    selectedColumnsKeys.includes(col.accessorKey as string),
  );

  const [approvalFinance, setApprovalFinance] = useState<Finance | null>(null);
  const [approvalLoading, setApprovalLoading] = useState(false);
  const [paidFinance, setPaidFinance] = useState<Finance | null>(null);
  const [generatingPdf, setGeneratingPdf] = useState(false);

  const walletForm = useForm<{ initialValue: number }>({
    defaultValues: { initialValue: 0 },
  });

  const approvalMutation = useFinanceApprovalMutation();
  const financeMutation = useFinanceMutation();

  const { hasPermission, isReady: permissionsReady } = useCompanyPermissions();
  const canWrite = permissionsReady && hasPermission('financial', 'write');
  const canAdmin = permissionsReady && hasPermission('financial', 'admin');
  const canEdit = canWrite || canAdmin;

  const handleDownloadPdf = async () => {
    setGeneratingPdf(true);
    try {
      const tableHeader = columnsToShow.map((col) => ({
        label: String(col.header ?? col.accessorKey ?? ''),
        value: col.accessorKey as keyof FinanceReportRow,
      }));

      const report = await getFinanceReportData();

      const totalValue = report.finances.reduce(
        (acc, f) => acc + Number(f.value || 0),
        0,
      );
      const formattedTotal = Intl.NumberFormat('pt-BR', {
        currency: 'BRL',
        style: 'currency',
      }).format(totalValue / 100);

      const data: FinanceReportRow[] = report.finances.map((f) => ({
        protocol: f.protocol || '-',
        title: f.title || '-',
        type: (f as any).type?.name || '-',
        flow: financeFlowLabels[f.flow]?.label || f.flow || '-',
        value: Number((f.value || 0) / 100).toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        }),
        tax: Number((f.tax || 0) / 100).toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        }),
        retention: Number((f.retention || 0) / 100).toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        }),
        date: formatDate(f.date) || '-',
        paymentDate: f.paymentDate ? formatDate(f.paymentDate) : '-',
        bank: f.bank?.name || '-',
        method: (f as any).method?.name || '-',
        category: f.category?.name || '-',
        client: f.client?.name || '-',
        employee: (f as any).employee?.name || '-',
        payee: f.payee?.name || '-',
        createdBy: f.createdBy?.name || '-',
        status:
          f.approved === false
            ? 'Aguardando aprov.'
            : f.status === FinanceStatusEnum.PAID &&
                f.paymentDate &&
                f.date &&
                new Date(f.paymentDate) > new Date(f.date)
              ? 'Pago em atraso'
              : financeStatusLabels[f.status]?.label || f.status || '-',
      }));

      const subtitleParts = [`Total: ${formattedTotal}`];
      if (report.total > report.limit) {
        subtitleParts.push(
          `Relatório limitado a ${report.limit} itens de ${report.total} disponíveis.`,
        );
      }

      await makeTablePDF(
        tableHeader,
        data,
        'Relatório Financeiro',
        subtitleParts.join(' | '),
      );
    } finally {
      setGeneratingPdf(false);
    }
  };

  const tableActions: Actions<Finance>[] = [];

  if (canEdit) {
    tableActions.push({
      icon: () => <EditOutlined />,
      label: () => 'Editar lançamento',
      onClick: handleSelectFinanceToEdit,
      condition: (row) => row.status !== FinanceStatusEnum.PAID,
    });

    tableActions.push({
      icon: () => <CheckCircleOutlined />,
      label: () => 'Marcar como pago',
      onClick: (row) => setPaidFinance(row),
      condition: (row) =>
        row.approved !== false &&
        row.status !== FinanceStatusEnum.PAID &&
        row.status !== FinanceStatusEnum.REJECTED,
    });

    tableActions.push({
      icon: () => <UndoOutlined />,
      label: () => 'Reverter pagamento',
      onClick: async (row) => {
        try {
          await financeMutation.mutateAsync({
            type: 'revert-payment',
            id: row.id,
          });
          toast.success('Pagamento revertido com sucesso');
          await handleReload();
        } catch {
          toast.error('Erro ao reverter pagamento');
        }
      },
      condition: (row) => row.status === FinanceStatusEnum.PAID,
    });
  }

  if (canAdmin) {
    tableActions.push({
      icon: () => <DeleteOutlined />,
      label: () => 'Excluir lançamento',
      onClick: (row) => handleDeleteFinance(row.id),
    });

    tableActions.push({
      icon: () => <ThumbsUpDownOutlined />,
      label: () => 'Aprovar / Reprovar',
      onClick: (row) => setApprovalFinance(row),
      condition: (row) => row.approved === false,
    });
  }

  const handleApprove = async (approved: boolean) => {
    if (!approvalFinance) return;
    setApprovalLoading(true);
    try {
      await approvalMutation.mutateAsync({ id: approvalFinance.id, approved });
      toast.success(approved ? 'Lançamento aprovado' : 'Lançamento reprovado');
      setApprovalFinance(null);
    } catch {
      toast.error('Erro ao processar aprovação');
    } finally {
      setApprovalLoading(false);
    }
  };

  const walletAmount = wallet
    ? Number(wallet.amount / 100).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      })
    : '—';

  return (
    <>
      {loading && <Loading fullScreen message="Carregando lançamentos..." />}

      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        flexWrap="wrap"
        gap={2}
        mb={2}
      >
        <Typography variant="h5" color="primary" fontWeight="bold">
          FINANCEIRO
        </Typography>

        <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
          <Box
            display="flex"
            alignItems="center"
            gap={1}
            bgcolor="background.paper"
            border="1px solid"
            borderColor="divider"
            borderRadius={1}
            px={2}
            py={0.5}
          >
            <AccountBalanceWalletOutlined color="primary" />
            <Typography variant="body2" fontWeight="bold">
              Carteira: {walletAmount}
            </Typography>
            <Tooltip title="Recalcular carteira">
              <span>
                <Button
                  size="small"
                  variant="text"
                  onClick={handleRecalculate}
                  disabled={walletRecalculating}
                  sx={{ minWidth: 'auto', p: 0.5 }}
                >
                  <RefreshOutlined fontSize="small" />
                </Button>
              </span>
            </Tooltip>
            {canAdmin && (
              <Tooltip title="Editar valor inicial da carteira">
                <span>
                  <Button
                    size="small"
                    variant="text"
                    onClick={() => {
                      walletForm.reset({
                        initialValue: (wallet?.initialValue ?? 0) / 100,
                      });
                      setOpenWalletEditModal(true);
                    }}
                    sx={{ minWidth: 'auto', p: 0.5 }}
                  >
                    <EditOutlined fontSize="small" />
                  </Button>
                </span>
              </Tooltip>
            )}
          </Box>

          {canEdit && (
            <Button
              variant="outlined"
              startIcon={<CompareArrowsOutlined />}
              onClick={() => setOpenTransferModal(true)}
            >
              Transferir
            </Button>
          )}

          <Button
            variant="contained"
            startIcon={<DownloadOutlined />}
            onClick={handleDownloadPdf}
            disabled={!count || generatingPdf}
          >
            Baixar PDF
          </Button>
        </Box>
      </Box>

      <ListHeader
        onAdd={canEdit ? handleOpenAdd : undefined}
        onReload={handleReload}
        onSearch={handleSearch}
        onShowFilters={toggleShowFilter}
        searchTitle="Pesquise por título, protocolo..."
        addTitle="Adicionar lançamento"
        viewMode={viewMode}
        onToggleView={toggleView}
        onCustomizeColumns={toggleCustomizeColumnsModal}
      />

      <FinanceFilter open={showFilter} onFilter={handleFilter} />

      {viewMode === 'table' ? (
        <Table
          data={finances}
          columns={columnsToShow}
          actions={tableActions}
          onRowClick={handleRowClick}
          rowCount={count}
          pagination={pagination}
          onPaginationChange={setPagination}
        />
      ) : (
        <Box
          display="flex"
          flexWrap="wrap"
          justifyContent="center"
          gap={2}
          mt={2}
        >
          {finances.length > 0 ? (
            finances.map((finance) => (
              <Box
                key={finance.id}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  width: { xs: '100%', sm: 'auto' },
                }}
              >
                <FinanceCard
                  finance={finance}
                  onClick={handleRowClick}
                  onEdit={
                    canEdit && finance.status !== FinanceStatusEnum.PAID
                      ? () => handleSelectFinanceToEdit(finance)
                      : undefined
                  }
                  onDelete={
                    canAdmin ? () => handleDeleteFinance(finance.id) : undefined
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

      <FinanceDrawer
        open={openModal}
        onClose={handleCloseAdd}
        finance={selectedFinance}
        onSuccess={handleReload}
      />

      {approvalFinance && (
        <ApprovalDrawer
          open={!!approvalFinance}
          onClose={() => setApprovalFinance(null)}
          onSubmit={handleApprove}
          loading={approvalLoading}
          title={`Aprovar: ${approvalFinance.title}`}
        />
      )}

      <CompanyTransferModal
        open={openTransferModal}
        onClose={() => setOpenTransferModal(false)}
        groupId={groupId}
        currentCompanyId={currentCompanyId}
      />

      <MarkAsPaidModal
        open={!!paidFinance}
        onClose={() => setPaidFinance(null)}
        finance={paidFinance}
        onSuccess={handleReload}
      />

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

      <Dialog
        open={openWalletEditModal}
        onClose={() => setOpenWalletEditModal(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Valor inicial da carteira</DialogTitle>
        <DialogContent sx={{ pt: '16px !important' }}>
          <CurrencyInput
            label="Valor inicial"
            name="initialValue"
            control={walletForm.control}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenWalletEditModal(false)} color="error">
            Cancelar
          </Button>
          <Button
            variant="contained"
            loading={walletUpdating}
            onClick={walletForm.handleSubmit((values) => {
              handleWalletUpdate(Math.round((values.initialValue ?? 0) * 100));
            })}
          >
            Salvar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
