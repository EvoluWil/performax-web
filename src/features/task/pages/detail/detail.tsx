'use client';

import {
  PageTitle,
  PendingApprovalAlert,
  SplitActions,
} from '@/components/common';
import { Loading } from '@/components/common/loading/loading';
import { ApprovalDrawer } from '@/components/drawer/approval-drawer/approval-drawer';
import { PdfPreviewModal } from '@/components/modal';
import {
  ConclusionModal,
  ImpedimentModal,
  TaskDetailCard,
  TaskDrawer,
} from '@/features/task/components';
import { Box, Divider } from '@mui/material';
import { useTaskDetail } from './detail.hook';

export const TaskDetail = () => {
  const {
    task,
    impedimentModalOpen,
    editModalOpen,
    loading,
    handleBack,
    handleStart,
    handleCancel,
    handleImpediment,
    toggleEditModal,
    toggleImpedimentModal,
    conclusionModalOpen,
    toggleConclusionModal,
    approvalDrawerOpen,
    toggleApprovalDrawer,
    handleApprove,
    handleDownloadPdf,
    handleResolved,
    handleReOpen,
    handleFinalize,
    handleUpdateChecklistItem,
    taskChecklistIncomplete,
    refetch,
    pdfModalOpen,
    pdfBlobUrl,
    pdfStorageUrl,
    pdfUploading,
    pdfTitle,
    closePdfModal,
    downloadPdf,
  } = useTaskDetail();

  if (!task) {
    return <Loading />;
  }

  return (
    <>
      {loading && <Loading fullScreen message="Atualizando OS..." />}
      <Box>
        <PageTitle
          title="Detalhe da OS"
          onBack={handleBack}
          actions={[
            {
              key: 'actions-menu',
              node: (
                <SplitActions
                  primaryLabel="Ações"
                  actions={[
                    {
                      key: 'start',
                      label: 'Iniciar',
                      onClick: handleStart,
                      visible:
                        task.approved !== false &&
                        [
                          'PENDING',
                          'OPEN',
                          'SCHEDULED',
                          'EMERGENCY',
                          'APPROVED',
                          'EXPIRED',
                        ].includes(task.status),
                    },
                    {
                      key: 'impediment',
                      label: 'Impedimento',
                      onClick: toggleImpedimentModal,
                      visible:
                        task.approved !== false &&
                        ['IN_PROGRESS'].includes(task.status),
                    },
                    {
                      key: 'edit',
                      label: 'Editar',
                      onClick: toggleEditModal,
                      visible: !['CLOSED'].includes(task.status),
                    },
                    {
                      key: 'finalize',
                      label: 'Finalizar',
                      onClick: toggleConclusionModal,
                      visible:
                        task.approved !== false &&
                        ['IN_PROGRESS'].includes(task.status),
                    },
                    {
                      key: 'cancel',
                      label: 'Cancelar',
                      onClick: handleCancel,
                      visible:
                        task.approved !== false &&
                        !['CLOSED', 'REJECTED'].includes(task.status),
                    },
                    {
                      key: 're-open',
                      label: 'Reabrir',
                      onClick: handleReOpen,
                      visible:
                        task.approved !== false &&
                        ['CLOSED'].includes(task.status),
                    },
                    {
                      key: 'resolved',
                      label: 'Resolver impedimento',
                      onClick: handleResolved,
                      visible:
                        task.approved !== false &&
                        ['IMPEDED'].includes(task.status),
                    },
                    {
                      key: 'approve',
                      label: 'Aprovar / Reprovar',
                      onClick: toggleApprovalDrawer,
                      visible: task.approved === false,
                    },
                    {
                      key: 'download',
                      label: 'Baixar PDF',
                      onClick: handleDownloadPdf,
                      visible: true,
                    },
                  ]}
                />
              ),
            },
          ]}
        />

        {task.approved === false && (
          <PendingApprovalAlert onAction={toggleApprovalDrawer} />
        )}

        <Divider sx={{ my: 2 }} />

        <TaskDetailCard
          task={task}
          onUpdateChecklistItem={handleUpdateChecklistItem}
        />
      </Box>
      {editModalOpen && (
        <TaskDrawer
          task={task}
          open
          onClose={toggleEditModal}
          onSuccess={refetch}
        />
      )}
      {impedimentModalOpen && (
        <ImpedimentModal
          open={impedimentModalOpen}
          onClose={toggleImpedimentModal}
          onSubmit={handleImpediment}
        />
      )}
      {conclusionModalOpen && (
        <ConclusionModal
          open={conclusionModalOpen}
          onClose={toggleConclusionModal}
          onSubmit={handleFinalize}
          hasIncompleteChecklist={taskChecklistIncomplete}
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
        title={task.title}
        onSubmit={handleApprove}
        loading={false}
      />
    </>
  );
};
