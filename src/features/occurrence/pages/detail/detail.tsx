'use client';

import { PageTitle, SplitActions } from '@/components/common';
import { Loading } from '@/components/common/loading/loading';
import { PdfPreviewModal } from '@/components/modal';
import {
  OccurrenceDetailCard,
  OccurrenceDrawer,
} from '@/features/occurrence/components';
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
    handleDownloadPdf,
    handleDelete,
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
