'use client';

import {
  useChecklistMutation,
  useTaskApprovalMutation,
  useTaskDetailQuery,
  useTaskMutation,
} from '@/features/task/hooks';
import { usePdfGenerator } from '@/hooks/common/pdf';
import { useUpload } from '@/hooks/common/upload';
import { hasIncompleteChecklist } from '@/utils/checklist';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import swal from 'sweetalert2';
import { ConclusionSchemaType } from '../../components';
import { ChecklistItemDto } from '../../types';
import { generateTaskPdfObject } from '../../util/task-pdf';

export const useTaskDetail = () => {
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [impedimentModalOpen, setImpedimentModalOpen] = useState(false);
  const [conclusionModalOpen, setConclusionModalOpen] = useState(false);
  const [approvalDrawerOpen, setApprovalDrawerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { sendFiles } = useUpload();
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
  const { taskId } = useParams();
  const { replace } = useRouter();
  const {
    data: task,
    error,
    refetch,
    isRefetching,
  } = useTaskDetailQuery(String(taskId));

  const taskMutation = useTaskMutation(String(taskId));
  const checklistMutation = useChecklistMutation();
  const approvalMutation = useTaskApprovalMutation();

  const toggleApprovalDrawer = () => setApprovalDrawerOpen((prev) => !prev);

  const handleApprove = async (approved: boolean) => {
    if (!task) return;
    await approvalMutation.mutateAsync({ id: task.id, approved });
    setApprovalDrawerOpen(false);
    refetch();
  };

  const handleBack = () => {
    if (typeof window !== 'undefined') {
      window.history.back();
    }
  };

  const handleStart = async () => {
    try {
      await taskMutation.mutateAsync({
        type: 'update',
        id: task?.id,
        data: { status: 'IN_PROGRESS' },
      });
      refetch();
    } catch (err: any) {
      window.alert('Falha ao iniciar a OS: ' + (err?.message || err));
    }
  };

  const handleCancel = async () => {
    try {
      await swal.fire({
        title: 'Cancelar OS',
        text: 'Tem certeza que deseja cancelar esta OS? Esta ação não pode ser desfeita.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sim, cancelar',
        preConfirm: async () => {
          await taskMutation.mutateAsync({
            type: 'update',
            id: task?.id,
            data: { status: 'REJECTED' },
          });
          refetch();
        },
      });
    } catch (err) {
      console.error(err);
    }
  };

  const toggleImpedimentModal = () => {
    setImpedimentModalOpen((prev) => !prev);
  };

  const handleImpediment = async (impedimentNote: string) => {
    try {
      const a = await taskMutation.mutateAsync({
        type: 'update',
        id: task?.id,
        data: { status: 'IMPEDED', impedimentNote },
      });
      if (a) {
        setImpedimentModalOpen(false);
        refetch();
      }
    } catch (err) {
      throw err;
    }
  };

  const toggleEditModal = () => {
    setEditModalOpen((prev) => !prev);
  };

  const handleDownloadPdf = async () => {
    const contents = await generateTaskPdfObject(task);
    await makeDetailPDF(`OS - ${task?.title}`, contents);
    setIsLoading(false);
  };

  const handleResolved = async () => {
    try {
      await taskMutation.mutateAsync({
        type: 'update',
        id: task?.id,
        data: { status: 'OPEN' },
      });
      refetch();
    } catch (err: any) {
      window.alert('Falha ao resolver impedimento: ' + (err?.message || err));
    }
  };

  const handleReOpen = async () => {
    try {
      await taskMutation.mutateAsync({
        type: 'update',
        id: task?.id,
        data: { status: 'OPEN' },
      });
      refetch();
    } catch (err: any) {
      window.alert('Falha ao reabrir a OS: ' + (err?.message || err));
    }
  };

  const toggleConclusionModal = () => setConclusionModalOpen((p) => !p);

  const handleFinalize = async (payload: ConclusionSchemaType) => {
    try {
      const conclusionFiles = [];
      if (payload.files && payload.files.length > 0) {
        const files = await sendFiles(
          payload.files as any,
          `tasks/${task?.id}/conclusion`,
        );
        conclusionFiles.push(...files);
      }

      await taskMutation.mutateAsync({
        type: 'update',
        id: task?.id,
        data: {
          ...{
            status: 'CLOSED',
            conclusionNote: payload.conclusionNote,
            conclusionFiles: conclusionFiles,
          },
        },
      });
      setConclusionModalOpen(false);
      refetch();
    } catch (err: any) {
      window.alert('Falha ao finalizar a OS: ' + (err?.message || err));
    }
  };

  const handleUpdateChecklistItem = async (
    item: ChecklistItemDto,
    checklistId: string,
  ) => {
    const result = await checklistMutation.mutateAsync({
      checklistId,
      itemId: item.id as string,
      data: {
        valueBoolean: item.valueBoolean,
        valueNumber: item.valueNumber,
        valueText: item.valueText,
      },
    });

    if (result) {
      refetch();
    }
  };

  const loading = taskMutation.isPending || isRefetching || isLoading;

  const taskChecklistIncomplete = useMemo(() => {
    return hasIncompleteChecklist(task?.checklist);
  }, [task]);

  useEffect(() => {
    if (error) {
      replace('/panel/tasks');
    }
  }, [error, replace]);

  return {
    task,
    loading,
    impedimentModalOpen,
    editModalOpen,
    conclusionModalOpen,
    approvalDrawerOpen,
    refetch,
    handleBack,
    handleStart,
    handleCancel,
    handleImpediment,
    toggleEditModal,
    toggleImpedimentModal,
    toggleConclusionModal,
    toggleApprovalDrawer,
    handleApprove,
    handleDownloadPdf,
    handleResolved,
    handleReOpen,
    handleFinalize,
    handleUpdateChecklistItem,
    taskChecklistIncomplete,
    pdfModalOpen,
    pdfBlobUrl,
    pdfStorageUrl,
    pdfUploading,
    pdfTitle,
    closePdfModal,
    downloadPdf,
  };
};
