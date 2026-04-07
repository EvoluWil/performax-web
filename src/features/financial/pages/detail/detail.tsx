'use client';

import {
  PageTitle,
  PendingApprovalAlert,
  SplitActions,
} from '@/components/common';
import { Loading } from '@/components/common/loading/loading';
import { ApprovalDrawer } from '@/components/drawer/approval-drawer/approval-drawer';
import { PdfPreviewModal } from '@/components/modal';
import { Box, Divider } from '@mui/material';
import { FinanceDetailCard } from '../../components/finance-detail-card/finance-detail-card';
import { FinanceDrawer } from '../../components/finance-drawer/finance-drawer';
import { MarkAsPaidModal } from '../../components/mark-as-paid-modal/mark-as-paid-modal';
import { useFinanceDetail } from './detail.hook';

export const FinanceDetail = () => {
  const {
    finance,
    loading,
    refetch,
    handleBack,
    handleDelete,
    handleApprove,
    canMarkAsPaid,
    editModalOpen,
    setEditModalOpen,
    approvalDrawerOpen,
    setApprovalDrawerOpen,
    paidModalOpen,
    setPaidModalOpen,
    handleDownloadPdf,
    pdfModalOpen,
    pdfBlobUrl,
    pdfStorageUrl,
    pdfUploading,
    pdfTitle,
    closePdfModal,
    downloadPdf,
  } = useFinanceDetail();

  if (!finance) {
    return <Loading />;
  }

  return (
    <>
      {loading && <Loading fullScreen message="Atualizando lançamento..." />}
      <Box>
        <PageTitle
          title="Detalhe do Lançamento"
          onBack={handleBack}
          actions={[
            {
              key: 'actions-menu',
              node: (
                <SplitActions
                  primaryLabel="Ações"
                  actions={[
                    {
                      key: 'approve',
                      label: 'Aprovar / Reprovar',
                      onClick: () => setApprovalDrawerOpen(true),
                      visible: finance.approved === false,
                    },
                    {
                      key: 'paid',
                      label: 'Marcar como Pago',
                      onClick: () => setPaidModalOpen(true),
                      visible: canMarkAsPaid,
                    },
                    {
                      key: 'edit',
                      label: 'Editar',
                      onClick: () => setEditModalOpen(true),
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

        {finance.approved === false && (
          <PendingApprovalAlert onAction={() => setApprovalDrawerOpen(true)} />
        )}

        <Divider sx={{ my: 2 }} />

        <FinanceDetailCard finance={finance} />
      </Box>

      {editModalOpen && (
        <FinanceDrawer
          finance={finance}
          open
          onClose={() => setEditModalOpen(false)}
          onSuccess={refetch}
        />
      )}

      <MarkAsPaidModal
        open={paidModalOpen}
        onClose={() => setPaidModalOpen(false)}
        finance={finance}
        onSuccess={refetch}
      />

      <ApprovalDrawer
        open={approvalDrawerOpen}
        onClose={() => setApprovalDrawerOpen(false)}
        title={finance.title}
        onSubmit={handleApprove}
        loading={false}
      />

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
