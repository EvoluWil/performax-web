'use client';

import { usePdfGenerator } from '@/hooks/common/pdf';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'react-toastify';
import {
  useFinanceApprovalMutation,
  useFinanceDetailQuery,
  useFinanceMutation,
} from '../../hooks/queries/finances.query';
import { FinanceStatusEnum } from '../../types/finance';
import { generateFinancePdfObject } from '../../util/finance-pdf';

export const useFinanceDetail = () => {
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [approvalDrawerOpen, setApprovalDrawerOpen] = useState(false);
  const [paidModalOpen, setPaidModalOpen] = useState(false);

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

  const { financeId } = useParams();
  const { replace } = useRouter();

  const {
    data: finance,
    isRefetching,
    refetch,
  } = useFinanceDetailQuery(String(financeId));

  const mutation = useFinanceMutation(String(financeId));
  const approvalMutation = useFinanceApprovalMutation();

  const handleBack = () => {
    if (typeof window !== 'undefined') window.history.back();
  };

  const handleDelete = async () => {
    if (!finance) return;
    try {
      await mutation.mutateAsync({ type: 'delete', id: finance.id });
      toast.success('Lançamento excluído');
      replace('/panel/financial');
    } catch {
      toast.error('Erro ao excluir lançamento');
    }
  };

  const handleApprove = async (approved: boolean) => {
    if (!finance) return;
    try {
      await approvalMutation.mutateAsync({ id: finance.id, approved });
      toast.success(approved ? 'Lançamento aprovado' : 'Lançamento reprovado');
      setApprovalDrawerOpen(false);
      await refetch();
    } catch {
      toast.error('Erro ao processar aprovação');
    }
  };

  const canMarkAsPaid =
    finance?.approved !== false && finance?.status !== FinanceStatusEnum.PAID;

  const handleDownloadPdf = async () => {
    if (!finance) return;
    const contents = generateFinancePdfObject(finance);
    await makeDetailPDF(`Lançamento - ${finance.title}`, contents as any);
  };

  const loading =
    mutation.isPending || approvalMutation.isPending || isRefetching;

  return {
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
  };
};
