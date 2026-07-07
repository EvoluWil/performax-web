'use client';

import { ConclusionSchemaType } from '@/features/task/components/conclusion-modal/conclusion.schema';
import { generateOccurrencePdfObject } from '@/features/occurrence/util/occurrence-pdf';
import { sendFiles } from '@/hooks/common/upload';
import { usePdfGenerator } from '@/hooks/common/pdf';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  useOccurrenceApprovalMutation,
  useOccurrenceDetailQuery,
  useOccurrenceMutation,
} from '../../hooks';

export const useOccurrenceDetail = () => {
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [approvalDrawerOpen, setApprovalDrawerOpen] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [conclusionModalOpen, setConclusionModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    makeDetailPDF,
    pdfModalOpen,
    pdfBlobUrl,
    pdfStorageUrl,
    pdfUploading,
    pdfTitle,
    closePdfModal,
    downloadPdf,
  } = usePdfGenerator();

  const { occurrenceId } = useParams();
  const { replace } = useRouter();

  const {
    data: occurrence,
    error,
    refetch,
    isRefetching,
  } = useOccurrenceDetailQuery(String(occurrenceId));

  const occurrenceMutation = useOccurrenceMutation(String(occurrenceId));
  const approvalMutation = useOccurrenceApprovalMutation();

  const toggleApprovalDrawer = () => setApprovalDrawerOpen((prev) => !prev);

  const handleApprove = async (approved: boolean) => {
    if (!occurrence) return;
    await approvalMutation.mutateAsync({ id: occurrence.id, approved });
    setApprovalDrawerOpen(false);
    refetch();
  };

  const handleBack = () => {
    if (typeof window !== 'undefined') window.history.back();
  };

  const toggleEditModal = () => {
    setEditModalOpen((prev) => !prev);
  };

  const handleDownloadPdf = async () => {
    if (!occurrence) return;

    setIsLoading(true);

    const contents = await generateOccurrencePdfObject(occurrence);

    await makeDetailPDF(`Ocorrência - ${occurrence.title}`, contents);
    setIsLoading(false);
  };

  const handleDelete = async () => {
    if (!occurrence) return;
    await occurrenceMutation.mutateAsync({ type: 'delete', id: occurrence.id });
    replace('/panel/occurrences');
  };

  const handleChangeStatus = async (status: string) => {
    if (!occurrence) return;
    await occurrenceMutation.mutateAsync({
      type: 'update',
      id: occurrence.id,
      data: { status } as any,
    });
    await refetch();
  };

  const toggleConclusionModal = () => setConclusionModalOpen((prev) => !prev);

  const handleFinalize = async (payload: ConclusionSchemaType) => {
    if (!occurrence) return;

    try {
      const conclusionFiles = [];
      if (payload.files && payload.files.length > 0) {
        const files = await sendFiles(
          payload.files as any,
          `occurrences/${occurrence.id}/conclusion`,
        );
        conclusionFiles.push(...files);
      }

      await occurrenceMutation.mutateAsync({
        type: 'update',
        id: occurrence.id,
        data: {
          status: 'COMPLETED',
          conclusionNote: payload.conclusionNote,
          conclusionFiles,
        },
      });
      setConclusionModalOpen(false);
      await refetch();
    } catch (err: any) {
      window.alert(
        'Falha ao finalizar a ocorrência: ' + (err?.message || err),
      );
    }
  };

  const loading = occurrenceMutation.isPending || isRefetching || isLoading;

  useEffect(() => {
    if (error) replace('/panel/occurrences');
  }, [error, replace]);

  return {
    occurrence,
    loading,
    editModalOpen,
    approvalDrawerOpen,
    statusModalOpen,
    setStatusModalOpen,
    handleBack,
    toggleEditModal,
    toggleApprovalDrawer,
    handleApprove,
    handleDownloadPdf,
    handleDelete,
    handleChangeStatus,
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
  };
};
