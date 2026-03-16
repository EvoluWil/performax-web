'use client';

import { generateOccurrencePdfObject } from '@/features/occurrence/util/occurrence-pdf';
import { usePdfGenerator } from '@/hooks/common/pdf';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useOccurrenceDetailQuery, useOccurrenceMutation } from '../../hooks';

export const useOccurrenceDetail = () => {
  const [editModalOpen, setEditModalOpen] = useState(false);
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

  const loading = occurrenceMutation.isPending || isRefetching || isLoading;

  useEffect(() => {
    if (error) replace('/panel/occurrences');
  }, [error, replace]);

  return {
    occurrence,
    loading,
    editModalOpen,
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
  };
};
