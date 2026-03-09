'use client';

import { usePdfGenerator } from '@/hooks/common/pdf';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  useBudgetDetailQuery,
  useBudgetMutation,
} from '../../hooks/queries/budgets.query';
import { generateBudgetPdfObject } from '../../util/budget-pdf';

export const useBudgetDetail = () => {
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
  const { budgetId } = useParams();
  const { replace } = useRouter();

  const {
    data: budget,
    error,
    refetch,
    isRefetching,
  } = useBudgetDetailQuery(String(budgetId));

  const budgetMutation = useBudgetMutation(String(budgetId));

  const handleChangeStatus = async (status: string) => {
    if (!budget) return;
    await budgetMutation.mutateAsync({
      type: 'update',
      id: budget.id,
      data: { status } as any,
    });
    await refetch();
  };

  const handleBack = () => {
    if (typeof window !== 'undefined') window.history.back();
  };

  const toggleEditModal = (newValue: boolean) => setEditModalOpen(newValue);

  const handleDownloadPdf = async () => {
    if (!budget) return;
    const contents = await generateBudgetPdfObject(budget);
    await makeDetailPDF(`Orçamento - ${budget.title}`, contents as any);
    setIsLoading(false);
  };

  const handleDelete = async () => {
    if (!budget) return;
    await budgetMutation.mutateAsync({ type: 'delete', id: budget.id });
    replace('/panel/budgets');
  };

  const loading = budgetMutation.isPending || isRefetching || isLoading;

  useEffect(() => {
    if (error) replace('/panel/budgets');
  }, [error, replace]);

  return {
    budget,
    loading,
    editModalOpen,
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
  };
};
