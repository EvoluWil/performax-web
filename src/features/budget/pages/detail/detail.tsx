'use client';
import React from 'react';

import { PageTitle, SplitActions } from '@/components/common';
import { Loading } from '@/components/common/loading/loading';
import { PdfPreviewModal } from '@/components/modal';
import { Box, Divider } from '@mui/material';
import { BudgetDetailCard } from '../../components/budget-detail-card/budget-detail-card';
import { BudgetDrawer } from '../../components/budget-drawer/budget';
import { BudgetStatusModal } from '../../components/status-modal/status.modal';
import { budgetStatusLabels } from '../../types/budget';
import { useBudgetDetail } from './detail.hook';

export const BudgetDetail = () => {
  const {
    budget,
    editModalOpen,
    loading,
    handleBack,
    toggleEditModal,
    handleDownloadPdf,
    handleDelete,
    refetch,
    handleChangeStatus,
    pdfModalOpen,
    pdfBlobUrl,
    pdfStorageUrl,
    pdfUploading,
    pdfTitle,
    closePdfModal,
    downloadPdf,
  } = useBudgetDetail();
  const [statusModalOpen, setStatusModalOpen] = React.useState(false);

  // Logical order: pending -> approved -> financial flow -> closed
  const orderedStatuses = [
    'PENDING',
    'APPROVED',
    'FINANCIAL',
    'CHARGED',
    'PAID',
    'COMPLETED',
    'REJECTED',
  ] as const;
  const statusOptions = orderedStatuses.map((s) => ({
    value: s,
    label: (budgetStatusLabels as any)[s]?.label || s,
  }));

  if (!budget) {
    return <Loading />;
  }

  return (
    <>
      {loading && <Loading fullScreen message="Atualizando orçamento..." />}
      <Box>
        <PageTitle
          title="Detalhe do Orçamento"
          onBack={handleBack}
          actions={[
            {
              key: 'actions-menu',
              node: (
                <SplitActions
                  primaryLabel="Ações"
                  actions={[
                    {
                      key: 'status',
                      label: 'Alterar status',
                      onClick: () => setStatusModalOpen(true),
                      visible: true,
                    },
                    {
                      key: 'edit',
                      label: 'Editar',
                      onClick: () => toggleEditModal(true),
                      visible: true,
                    },
                    {
                      key: 'download',
                      label: 'Baixar PDF',
                      onClick: handleDownloadPdf,
                      visible: true,
                    },
                    {
                      key: 'delete',
                      label: 'Excluir',
                      onClick: handleDelete,
                      visible: true,
                    },
                  ]}
                />
              ),
            },
          ]}
        />

        <Divider sx={{ my: 2 }} />

        <BudgetDetailCard budget={budget} />
      </Box>
      {editModalOpen && (
        <BudgetDrawer
          budget={budget}
          open
          onClose={() => toggleEditModal(false)}
          onSuccess={refetch}
        />
      )}
      {statusModalOpen && (
        <BudgetStatusModal
          open={statusModalOpen}
          onClose={() => setStatusModalOpen(false)}
          defaultStatus={budget.status}
          options={statusOptions}
          onSubmit={async (status: string) => {
            await handleChangeStatus(status);
            setStatusModalOpen(false);
          }}
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
