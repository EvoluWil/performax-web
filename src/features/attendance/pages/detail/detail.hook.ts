'use client';

import { ConclusionSchemaType } from '@/features/task/components';
import { useUpload } from '@/hooks/common/upload';
import { hasIncompleteChecklist } from '@/utils/checklist';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { useAttendanceMutation } from '../../hooks/queries/attendance-mutations';
import { useAttendanceTaskDetailQuery } from '../../hooks/queries/attendance-task-detail.query';

export const useAttendanceDetail = (companyId: string, taskId: string) => {
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [attachFilesOpen, setAttachFilesOpen] = useState(false);
  const [impedimentOpen, setImpedimentOpen] = useState(false);
  const [conclusionOpen, setConclusionOpen] = useState(false);

  const { sendFiles } = useUpload();
  const { back } = useRouter();

  const {
    data: task,
    isLoading: taskLoading,
    isRefetching,
    refetch,
  } = useAttendanceTaskDetailQuery(companyId, taskId);

  const mutation = useAttendanceMutation(companyId, taskId);

  const loading = mutation.isPending || isRefetching;

  const taskChecklistIncomplete = useMemo(
    () => hasIncompleteChecklist(task?.checklist),
    [task],
  );

  const handleBack = () => back();

  const handleStart = async () => {
    try {
      await mutation.mutateAsync({ status: 'IN_PROGRESS' });
      refetch();
    } catch (err: any) {
      window.alert('Falha ao iniciar a OS: ' + (err?.message || err));
    }
  };

  const handleReschedule = async (date: Date) => {
    try {
      await mutation.mutateAsync({ date: date.toISOString() });
      setRescheduleOpen(false);
      refetch();
    } catch (err: any) {
      window.alert('Falha ao reagendar: ' + (err?.message || err));
    }
  };

  const handleAddFiles = async (files: File[]) => {
    try {
      if (!files.length) {
        setAttachFilesOpen(false);
        return;
      }
      const uploaded = await sendFiles(files, `tasks/${taskId}/files`);
      const existing = (task?.files ?? []) as { url: string; type: string }[];
      await mutation.mutateAsync({
        files: [...existing, ...uploaded] as any,
      });
      setAttachFilesOpen(false);
      refetch();
    } catch (err: any) {
      window.alert('Falha ao anexar arquivos: ' + (err?.message || err));
    }
  };

  const handleImpediment = async (impedimentNote: string) => {
    try {
      await mutation.mutateAsync({ status: 'IMPEDED', impedimentNote });
      setImpedimentOpen(false);
      refetch();
    } catch (err: any) {
      throw err;
    }
  };

  const handleResolved = async () => {
    try {
      await mutation.mutateAsync({ status: 'OPEN' });
      refetch();
    } catch (err: any) {
      window.alert('Falha ao resolver impedimento: ' + (err?.message || err));
    }
  };

  const handleFinalize = async (payload: ConclusionSchemaType) => {
    try {
      const conclusionFiles: { url: string; type: string }[] = [];
      if (payload.files?.length) {
        const uploaded = await sendFiles(
          payload.files as any,
          `tasks/${taskId}/conclusion`,
        );
        conclusionFiles.push(...uploaded);
      }
      await mutation.mutateAsync({
        status: 'CLOSED',
        ...(payload.conclusionNote
          ? { conclusionNote: payload.conclusionNote }
          : {}),
        conclusionFiles: conclusionFiles as any,
      } as any);
      setConclusionOpen(false);
      refetch();
    } catch (err: any) {
      window.alert('Falha ao finalizar a OS: ' + (err?.message || err));
    }
  };

  return {
    task,
    loading,
    taskLoading,
    taskChecklistIncomplete,
    refetch,
    handleBack,
    handleStart,
    rescheduleOpen,
    setRescheduleOpen,
    handleReschedule,
    attachFilesOpen,
    setAttachFilesOpen,
    handleAddFiles,
    impedimentOpen,
    setImpedimentOpen,
    handleImpediment,
    handleResolved,
    conclusionOpen,
    setConclusionOpen,
    handleFinalize,
  };
};
