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
  BlockOutlined,
  CheckCircleOutline,
  DeleteOutlined,
  DownloadOutlined,
  EditOutlined,
  PictureAsPdfOutlined,
  RepeatOutlined,
  UploadFileOutlined,
} from '@mui/icons-material';
import { Box, Button, Chip, Link, Typography } from '@mui/material';
import { MRT_ColumnDef } from 'material-react-table';
import { useCallback, useRef, useState } from 'react';
import swal from 'sweetalert2';
import { ContractRecurringModal } from '../../components/contract-recurring-modal/contract-recurring-modal';
import { ContractDrawer } from '../../components/contract-drawer/contract';
import { ContractFilter } from '../../components/contract-filter/contract-filter';
import { SignedContractModal } from '../../components/signed-contract-modal/signed-contract-modal';
import { useContractPdf } from '../../hooks/use-contract-pdf';
import { getContractPdfTitle } from '../../util/contract-pdf';
import { Contract } from '../../types/contract';
import { useContractList } from './list.hook';

const columns: MRT_ColumnDef<Contract>[] = [
  {
    accessorKey: 'client',
    header: 'Cliente',
    Cell: ({ cell }) => cell.getValue<any>()?.name || '-',
  },
  {
    accessorKey: 'type',
    header: 'Tipo de contrato',
    Cell: ({ cell }) => cell.getValue<any>()?.name || '-',
  },
  {
    accessorKey: 'value',
    header: 'Valor',
    Cell: ({ cell }) =>
      (Number(cell.getValue()) / 100).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }),
  },
  {
    accessorKey: 'adjustment',
    header: 'Último reajuste',
    Cell: ({ row }) => {
      const pct = row.original.type?.lastAdjustmentPercentage;
      return pct != null ? `${pct}%` : '-';
    },
  },
  {
    accessorKey: 'startDate',
    header: 'Início',
    Cell: ({ cell }) =>
      cell.getValue() ? formatDate(cell.getValue() as string) : '-',
  },
  {
    accessorKey: 'endDate',
    header: 'Término',
    Cell: ({ cell }) =>
      cell.getValue() ? formatDate(cell.getValue() as string) : '-',
  },
  {
    accessorKey: 'dueDate',
    header: 'Vencimento',
    Cell: ({ cell }) =>
      cell.getValue() ? formatDate(cell.getValue() as string) : '-',
  },
  {
    accessorKey: 'scope',
    header: 'Escopo',
    Cell: ({ cell }) => {
      const value = cell.getValue<string>();
      if (!value) return '-';
      return value.length > 60 ? `${value.slice(0, 60)}...` : value;
    },
  },
  {
    accessorKey: 'active',
    header: 'Status',
    Cell: ({ cell }) => {
      const active = cell.getValue<boolean>();
      return (
        <Chip
          label={active ? 'Ativo' : 'Inativo'}
          size="small"
          color={active ? 'success' : 'default'}
          variant="outlined"
        />
      );
    },
  },
  {
    accessorKey: 'recurringId',
    header: 'Recorrência',
    Cell: ({ cell }) => {
      const id = cell.getValue<string | null>();
      return (
        <Chip
          label={id ? 'Sim' : 'Não'}
          size="small"
          color={id ? 'primary' : 'default'}
          variant="outlined"
        />
      );
    },
  },
  {
    accessorKey: 'generatedPdf',
    header: 'PDF gerado',
    Cell: ({ cell }) => {
      const file = cell.getValue<any>();
      if (!file?.url) return '-';
      return (
        <Link href={file.url} target="_blank" rel="noopener noreferrer">
          PDF
        </Link>
      );
    },
  },
  {
    accessorKey: 'attachment',
    header: 'Contrato assinado',
    Cell: ({ cell }) => {
      const file = cell.getValue<any>();
      if (!file?.url) return '-';
      return (
        <Link href={file.url} target="_blank" rel="noopener noreferrer">
          PDF
        </Link>
      );
    },
  },
];

type ContractReportRow = Record<string, string>;

export const ContractList = () => {
  const {
    contracts,
    handleReload,
    handleSearch,
    showFilter,
    toggleShowFilter,
    handleFilter,
    selectedColumnsKeys,
    toggleCustomizeColumnsModal,
    openCustomizeColumnsModal,
    openModal,
    selectedContract,
    handleOpenAdd,
    handleCloseAdd,
    handleSelectContractToEdit,
    handleDeleteContract,
    handleInactivateContract,
    handleActivateContract,
    defaultColumns,
    tableKey,
    handleUpdateColumns,
    pagination,
    handlePaginationChange,
    count,
    getContractReportData,
    loading,
  } = useContractList();

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
  const canWrite = permissionsReady && hasPermission('client', 'write');
  const canAdmin = permissionsReady && hasPermission('client', 'admin');
  const canEdit = canWrite || canAdmin;
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [recurringLoading, setRecurringLoading] = useState(false);
  const [generatedPreview, setGeneratedPreview] = useState<{
    url: string;
    blobUrl: string;
    title: string;
  } | null>(null);
  const previewBlobRef = useRef<string | null>(null);
  const [signedTarget, setSignedTarget] = useState<Contract | null>(null);
  const [recurringTarget, setRecurringTarget] = useState<Contract | null>(
    null,
  );

  const { generateAndSaveContractPdf, generating: regeneratingPdf } =
    useContractPdf();

  const clearGeneratedPreview = useCallback(() => {
    if (previewBlobRef.current) {
      URL.revokeObjectURL(previewBlobRef.current);
      previewBlobRef.current = null;
    }
    setGeneratedPreview(null);
  }, []);

  const promptCreateRecurring = useCallback(async (contract: Contract) => {
    if (!contract.active || contract.recurringId || !contract.dueDate) return;

    const result = await swal.fire({
      title: 'Deseja criar uma recorrência financeira para este contrato?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sim',
      cancelButtonText: 'Não',
    });

    if (result.isConfirmed) {
      setRecurringTarget(contract);
    }
  }, []);

  const tableActions: Actions<Contract>[] = [];

  if (canEdit) {
    tableActions.push({
      icon: () => <PictureAsPdfOutlined />,
      label: () => 'Gerar PDF do contrato',
      onClick: async (row) => {
        const generatedPdf = await generateAndSaveContractPdf(row);
        if (generatedPdf) {
          clearGeneratedPreview();
          const blobUrl = URL.createObjectURL(generatedPdf.blob);
          previewBlobRef.current = blobUrl;
          setGeneratedPreview({
            url: generatedPdf.url,
            blobUrl,
            title: getContractPdfTitle(row),
          });
          await handleReload();
        }
      },
    });

    tableActions.push({
      icon: () => <UploadFileOutlined />,
      label: (row) =>
        row.attachment?.url
          ? 'Editar contrato assinado'
          : 'Adicionar contrato assinado',
      onClick: (row) => setSignedTarget(row),
    });

    tableActions.push({
      icon: () => <RepeatOutlined />,
      label: () => 'Gerar recorrência',
      onClick: (row) => setRecurringTarget(row),
      condition: (row) => row.active && !row.recurringId && !!row.dueDate,
    });

    tableActions.push({
      icon: () => <EditOutlined />,
      label: () => 'Editar contrato',
      onClick: handleSelectContractToEdit,
    });

    tableActions.push({
      icon: () => <BlockOutlined />,
      label: () => 'Inativar contrato',
      onClick: (row) => handleInactivateContract(row.id),
      condition: (row) => row.active,
    });

    tableActions.push({
      icon: () => <CheckCircleOutline />,
      label: () => 'Reativar contrato',
      onClick: (row) => handleActivateContract(row.id),
      condition: (row) => !row.active,
    });
  }

  if (canAdmin) {
    tableActions.push({
      icon: () => <DeleteOutlined />,
      label: () => 'Excluir contrato',
      onClick: (row) => handleDeleteContract(row.id),
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
        value: column.accessorKey as string,
      }));

      const report = await getContractReportData();

      const data: ContractReportRow[] = report.contracts.map((contract) => ({
        client: contract.client?.name || '-',
        type: contract.type?.name || '-',
        value: ((contract.value || 0) / 100).toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        }),
        adjustment:
          contract.type?.lastAdjustmentPercentage != null
            ? `${contract.type.lastAdjustmentPercentage}%`
            : '-',
        startDate: contract.startDate
          ? formatDate(contract.startDate as string)
          : '-',
        endDate: contract.endDate
          ? formatDate(contract.endDate as string)
          : '-',
        dueDate: contract.dueDate
          ? formatDate(contract.dueDate as string)
          : '-',
        scope: contract.scope || '-',
        active: contract.active ? 'Ativo' : 'Inativo',
        recurringId: contract.recurringId ? 'Sim' : 'Não',
        generatedPdf: contract.generatedPdf?.url ? 'Sim' : '-',
        attachment: contract.attachment?.url ? 'Sim' : '-',
      }));

      const subtitleParts: string[] = [];
      if (report.total > report.limit) {
        subtitleParts.push(
          `Relatório limitado a ${report.limit} itens de ${report.total} disponíveis.`,
        );
      }

      await makeTablePDF(
        tableHeader,
        data,
        'Relatório de contratos',
        subtitleParts.join(' | ') || undefined,
      );
    } finally {
      setGeneratingPdf(false);
    }
  };

  return (
    <>
      {loading && <Loading fullScreen message="Carregando contratos..." />}
      {(generatingPdf || regeneratingPdf) && (
        <Loading fullScreen message="Gerando PDF do contrato..." />
      )}
      {recurringLoading && (
        <Loading fullScreen message="Criando recorrência financeira..." />
      )}

      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        flexWrap="wrap"
        gap={2}
      >
        <Typography variant="h5" gutterBottom color="primary" fontWeight="bold">
          CONTRATOS
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
        searchTitle="Pesquise por cliente, tipo ou escopo"
        addTitle="Adicionar contrato"
        onShowFilters={toggleShowFilter}
        onCustomizeColumns={toggleCustomizeColumnsModal}
      />

      <ContractFilter
        open={showFilter}
        onFilter={(filter) => handleFilter(filter)}
      />

      <Table
        columns={columnsToShow}
        data={contracts || []}
        emptyMessage="Nenhum resultado encontrado"
        onReload={handleReload}
        onRowClick={canEdit ? handleSelectContractToEdit : undefined}
        loading={loading}
        actions={tableActions}
        pagination={pagination}
        onPaginationChange={handlePaginationChange}
        rowCount={count}
      />

      {openModal && (
        <ContractDrawer
          contract={selectedContract}
          open={openModal}
          onClose={handleCloseAdd}
          onSuccess={handleReload}
          onSaved={promptCreateRecurring}
        />
      )}

      {signedTarget && (
        <SignedContractModal
          open={!!signedTarget}
          onClose={() => setSignedTarget(null)}
          contract={signedTarget}
          onSuccess={handleReload}
        />
      )}

      {recurringTarget && (
        <ContractRecurringModal
          open={!!recurringTarget}
          onClose={() => setRecurringTarget(null)}
          contract={recurringTarget}
          onSuccess={handleReload}
          onLoadingChange={setRecurringLoading}
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
        open={pdfModalOpen || !!generatedPreview}
        onClose={() => {
          closePdfModal();
          clearGeneratedPreview();
        }}
        pdfBlobUrl={generatedPreview?.blobUrl ?? pdfBlobUrl}
        pdfStorageUrl={generatedPreview?.url ?? pdfStorageUrl}
        pdfUploading={generatedPreview ? false : pdfUploading}
        title={generatedPreview?.title ?? pdfTitle}
        onDownload={() => {
          if (generatedPreview?.blobUrl) {
            const a = document.createElement('a');
            a.href = generatedPreview.blobUrl;
            a.download = `${generatedPreview.title}.pdf`;
            a.click();
            return;
          }
          if (generatedPreview?.url) {
            window.open(generatedPreview.url, '_blank');
            return;
          }
          downloadPdf();
        }}
      />
    </>
  );
};
