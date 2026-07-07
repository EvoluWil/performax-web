'use client';

import {
  PageTitle,
  PendingApprovalAlert,
  SplitActions,
} from '@/components/common';
import { Loading } from '@/components/common/loading/loading';
import { ApprovalDrawer } from '@/components/drawer/approval-drawer/approval-drawer';
import { PdfPreviewModal } from '@/components/modal';
import { BudgetStatusModal } from '@/features/budget/components/status-modal/status.modal';
import { ConclusionModal } from '@/features/task/components/conclusion-modal/conclusion.modal';
import {
  OccurrenceDetailCard,
  OccurrenceDrawer,
} from '@/features/occurrence/components';
import {
  OccurrenceStatusEnum,
  occurrenceStatusLabels,
} from '@/features/occurrence/types';
import { useCompanyPermissions } from '@/hooks/common/permission';
import { Box, Divider } from '@mui/material';
import { useOccurrenceDetail } from './detail.hook';

export const OccurrenceDetail = () => {
  const {
    occurrence,
    editModalOpen,
    loading,
    handleBack,
    toggleEditModal,
    toggleApprovalDrawer,
    handleApprove,
    approvalDrawerOpen,
    statusModalOpen,
    setStatusModalOpen,
    handleChangeStatus,
    handleDownloadPdf,
    handleDelete,
    toggleConclusionModal,
    conclusionModalOpen,
    handleFinalize,
    refetch,
    pdfModalOpen,
    pdfBlobUrl,
    pdfStorageUrl,
    pdfUploading,
    pdfTitle,
    closePdfModal,
    downloadPdf,
  } = useOccurrenceDetail();

  const { hasPermission, isReady } = useCompanyPermissions();
  const canWrite = isReady && hasPermission('occurrence', 'write');
  const canAdmin = isReady && hasPermission('occurrence', 'admin');
  const canEdit = canWrite || canAdmin;

  const orderedStatuses = [
    OccurrenceStatusEnum.PENDING,
    OccurrenceStatusEnum.APPROVED,
    OccurrenceStatusEnum.IN_PROGRESS,
    OccurrenceStatusEnum.REJECTED,
  ] as const;
  const statusOptions = orderedStatuses.map((s) => ({
    value: s,
    label: occurrenceStatusLabels[s]?.label || s,
  }));

  if (!occurrence) {
    return <Loading />;
  }

  return (
    <>
      {loading && <Loading fullScreen message="Atualizando ocorrência..." />}
      <Box>
        <PageTitle
          title="Detalhe da ocorrência"
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
                      onClick: toggleApprovalDrawer,
                      visible: occurrence.approved === false,
                    },
                    {
                      key: 'status',
                      label: 'Alterar status',
                      onClick: () => setStatusModalOpen(true),
                      visible: occurrence.approved !== false,
                    },
                    {
                      key: 'finalize',
                      label: 'Finalizar',
                      onClick: toggleConclusionModal,
                      visible:
                        occurrence.approved !== false &&
                        occurrence.status === OccurrenceStatusEnum.IN_PROGRESS,
                    },
                    {
                      key: 'edit',
                      label: 'Editar',
                      onClick: toggleEditModal,
                      visible: canEdit,
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
                      visible: canAdmin,
                    },
                  ]}
                />
              ),
            },
          ]}
        />

        {occurrence.approved === false && (
          <PendingApprovalAlert onAction={toggleApprovalDrawer} />
        )}

        <Divider sx={{ my: 2 }} />

        <OccurrenceDetailCard occurrence={occurrence} />
      </Box>

      {editModalOpen && (
        <OccurrenceDrawer
          occurrence={occurrence}
          open={editModalOpen}
          onClose={toggleEditModal}
          onSuccess={refetch}
        />
      )}

      {statusModalOpen && (
        <BudgetStatusModal
          open={statusModalOpen}
          onClose={() => setStatusModalOpen(false)}
          defaultStatus={occurrence.status}
          options={statusOptions}
          title="Alterar status da ocorrência"
          onSubmit={async (status) => {
            await handleChangeStatus(status);
            setStatusModalOpen(false);
          }}
        />
      )}
      {conclusionModalOpen && (
        <ConclusionModal
          open={conclusionModalOpen}
          onClose={toggleConclusionModal}
          onSubmit={handleFinalize}
          title="Finalizar ocorrência"
          description="Informe a descrição da tratativa e, opcionalmente, anexe arquivos relacionados ao encerramento."
          noteLabel="Descrição da tratativa"
          submitLabel="Concluir ocorrência"
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
        open={approvalDrawerOpen}
        onClose={toggleApprovalDrawer}
        title={occurrence.title}
        onSubmit={handleApprove}
        loading={false}
      />
    </>
  );
};
