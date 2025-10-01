"use client";

import { useTaskDetailQuery, useTaskMutation } from "@/features/task/hooks";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ChecklistDto } from "../../types";

export const useTaskDetail = () => {
  const [openModal, setOpenModal] = useState(false);

  const { taskId } = useParams();
  const { replace } = useRouter();
  const {
    data: task,
    error,
    refetch,
    isRefetching,
  } = useTaskDetailQuery(String(taskId));

  const taskMutation = useTaskMutation(String(taskId));

  const handleBack = () => {
    if (typeof window !== "undefined") {
      window.history.back();
    }
  };

  const handleStart = async () => {
    try {
      await taskMutation.mutateAsync({
        type: "update",
        id: task?.id,
        data: { status: "IN_PROGRESS" },
      });
      refetch();
    } catch (err: any) {
      window.alert("Falha ao iniciar a tarefa: " + (err?.message || err));
    }
  };

  const handleCancel = async () => {
    try {
      await taskMutation.mutateAsync({
        type: "update",
        id: task?.id,
        data: { status: "REJECTED" },
      });
      refetch();
    } catch (err: any) {
      window.alert("Falha ao cancelar a tarefa: " + (err?.message || err));
    }
  };

  const handleImpediment = async () => {
    try {
      await taskMutation.mutateAsync({
        type: "update",
        id: task?.id,
        data: { status: "IMPEDED" },
      });
      refetch();
    } catch (err: any) {
      window.alert("Falha ao registrar impedimento: " + (err?.message || err));
    }
  };

  const toggleEditModal = () => {
    setOpenModal((prev) => !prev);
  };

  const handleDownloadPdf = () => {
    const url = `/panel/tasks/${task?.id}/pdf`;
    if (typeof window !== "undefined") {
      window.open(url, "_blank");
    }
  };

  const handleResolved = async () => {
    try {
      await taskMutation.mutateAsync({
        type: "update",
        id: task?.id,
        data: { status: "OPEN" },
      });
      refetch();
    } catch (err: any) {
      window.alert("Falha ao resolver impedimento: " + (err?.message || err));
    }
  };

  const handleReOpen = async () => {
    try {
      await taskMutation.mutateAsync({
        type: "update",
        id: task?.id,
        data: { status: "OPEN" },
      });
      refetch();
    } catch (err: any) {
      window.alert("Falha ao reabrir a tarefa: " + (err?.message || err));
    }
  };

  const handleFinalize = async () => {
    try {
      await taskMutation.mutateAsync({
        type: "update",
        id: task?.id,
        data: { status: "CLOSED" },
      });
      refetch();
    } catch (err: any) {
      window.alert("Falha ao finalizar a tarefa: " + (err?.message || err));
    }
  };

  const handleUpdateChecklist = async (checklist: ChecklistDto) => {
    console.log("TODO: update checklist", checklist);
  };

  const loading = taskMutation.isPending || isRefetching;

  useEffect(() => {
    if (error) {
      replace("/panel/tasks");
    }
  }, [error, replace]);

  return {
    task,
    loading,
    openModal,
    handleBack,
    handleStart,
    handleCancel,
    handleImpediment,
    toggleEditModal,
    handleDownloadPdf,
    handleResolved,
    handleReOpen,
    handleFinalize,
    handleUpdateChecklist,
  };
};
