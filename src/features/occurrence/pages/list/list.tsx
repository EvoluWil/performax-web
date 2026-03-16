'use client';

import { Empty, ListHeader, Table } from '@/components/common';
import { Loading } from '@/components/common/loading/loading';
import { Actions } from '@/components/common/table/table';
import { PdfPreviewModal } from '@/components/modal';
import { CustomizeColumnsModal } from '@/components/modal/customize-columns/customize-columns.modal';
import {
  OccurrenceCard,
  OccurrenceDrawer,
  OccurrenceFilter,
} from '@/features/occurrence/components';
import {
  Occurrence,
  OccurrenceStatusEnum,
  occurrenceStatusLabels,
} from '@/features/occurrence/types';
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
import { useOccurrenceList } from './list.hook';

const columns: MRT_ColumnDef<Occurrence>[] = [
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
    accessorKey: 'type',
    header: 'Tipo',
    Cell({ cell }: any) {
      return cell.getValue()?.name;
    },
  },
  {
    accessorKey: 'createdBy',
    header: 'Criado por',
    Cell({ cell }: any) {
      return cell.getValue()?.name;
    },
  },
  {
    accessorKey: 'date',
    header: 'Data da ocorrência',
    Cell({ cell }: any) {
      return formatDate(cell.getValue());
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
      const status = cell.getValue() as OccurrenceStatusEnum;
      const { label, color } = occurrenceStatusLabels[status] || {
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

type OccurrenceReportRow = {
  protocol: string;
  title: string;
  client: string;
  type: string;
  createdBy: string;
  date: string;
  createdAt: string;
  status: string;
};

const columnsKeys = columns.map((col) => col.accessorKey as string);

export const OccurrenceList = () => {
  const {
    occurrences,
    openModal,
    selectedOccurrence,
    handleOpenAdd,
    handleCloseAdd,
    handleSelectOccurrenceToEdit,
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
    handleDeleteOccurrence,
    defaultColumns,
    tableKey,
    handleUpdateColumns,
    pagination,
    handlePaginationChange,
    count,
    getOccurrenceReportData,
  } = useOccurrenceList();

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
  const canWrite = permissionsReady && hasPermission('occurrence', 'write');
  const canAdmin = permissionsReady && hasPermission('occurrence', 'admin');
  const canEdit = canWrite || canAdmin;
  const [generatingPdf, setGeneratingPdf] = useState(false);

  const tableActions: Actions<Occurrence>[] = [];

  if (canEdit) {
    tableActions.push({
      icon: () => <EditOutlined />,
      label: () => 'Editar ocorrência',
      onClick: handleSelectOccurrenceToEdit,
    });
  }

  if (canAdmin) {
    tableActions.push({
      icon: () => <DeleteOutlined />,
      label: () => 'Excluir ocorrência',
      onClick: (row) => handleDeleteOccurrence(row.id),
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
        value: column.accessorKey as keyof OccurrenceReportRow,
      }));

      const report = await getOccurrenceReportData();

      const data: OccurrenceReportRow[] = report.occurrences.map(
        (occurrence) => ({
          protocol: occurrence.protocol || '-',
          title: occurrence.title || '-',
          client: occurrence.client?.name || '-',
          type: occurrence.type?.name || '-',
          createdBy: occurrence.createdBy?.name || '-',
          date: occurrence.date ? formatDate(occurrence.date) : '-',
          createdAt: occurrence.createdAt
            ? formatDate(occurrence.createdAt)
            : '-',
          status: occurrence.status
            ? occurrenceStatusLabels[occurrence.status]?.label || '-'
            : '-',
        }),
      );

      const subtitleParts = [`Total de ocorrências: ${report.total}`];
      if (report.total > report.limit) {
        subtitleParts.push(
          `Relatório limitado a ${report.limit} itens de ${report.total} disponíveis.`,
        );
      }

      await makeTablePDF(
        tableHeader,
        data,
        'Relatório de ocorrências',
        subtitleParts.join(' | '),
      );
    } finally {
      setGeneratingPdf(false);
    }
  };

  return (
    <>
      {loading && <Loading fullScreen message="Carregando ocorrências..." />}

      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        flexWrap="wrap"
        gap={2}
      >
        <Typography variant="h5" gutterBottom color="primary" fontWeight="bold">
          OCORRÊNCIAS
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
        addTitle="Adicionar ocorrência"
        onShowFilters={toggleShowFilter}
        onToggleView={toggleView}
        viewMode={viewMode}
        onCustomizeColumns={toggleCustomizeColumnsModal}
      />

      <OccurrenceFilter
        open={showFilter}
        onFilter={(filter) => handleFilter(filter)}
        loading={false}
      />

      {viewMode === 'table' ? (
        <Table
          columns={columnsToShow}
          data={occurrences || []}
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
          {occurrences && occurrences.length > 0 ? (
            occurrences.map((occurrence) => (
              <Box
                key={occurrence.id}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  width: { xs: '100%', sm: 'auto' },
                }}
              >
                <OccurrenceCard
                  occurrence={occurrence}
                  onClick={() => handleRowClick(occurrence)}
                  onEdit={
                    canEdit
                      ? () => handleSelectOccurrenceToEdit(occurrence)
                      : undefined
                  }
                  onDelete={
                    canAdmin
                      ? () => handleDeleteOccurrence(occurrence.id)
                      : undefined
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

      {openModal && (
        <OccurrenceDrawer
          occurrence={selectedOccurrence}
          open={openModal}
          onClose={handleCloseAdd}
          onSuccess={handleReload}
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
