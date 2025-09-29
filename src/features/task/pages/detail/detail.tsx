"use client";

import { PageTitle, SplitActions } from "@/components/common";
import { Loading } from "@/components/common/loading/loading";
import { TaskDetailCard } from "@/features/task/components";
import { useTaskMutation } from "@/features/task/hooks";
import { Box, Divider } from "@mui/material";
import { useRouter } from "next/navigation";
import { useTaskDetail } from "./detail.hook";

export const TaskDetail = () => {
  const { task } = useTaskDetail();
  const router = useRouter();
  const taskMutation = useTaskMutation();

  if (!task) {
    return <Loading />;
  }

  const handleBack = () => {
    if (typeof window !== "undefined") {
      window.history.back();
    }
  };

  const buildUpdatePayload = (status: string) => {
    return {
      title: task.title,
      description: task.description,
      date: task.date
        ? new Date(task.date).toISOString()
        : new Date().toISOString(),
      files: task.files,
      responsibleId: task.responsibleId,
      clientId: task.clientId,
      typeId: task.typeId,
      status,
      internalNote: task.internalNote,
      checklist: task.checklist || { modules: [] },
    };
  };

  const handleStart = async () => {
    try {
      await taskMutation.mutateAsync({
        type: "update",
        id: task.id,
        data: buildUpdatePayload("IN_PROGRESS"),
      });
      router.refresh();
    } catch (err: any) {
      window.alert("Falha ao iniciar a tarefa: " + (err?.message || err));
    }
  };

  const handleCancel = async () => {
    try {
      await taskMutation.mutateAsync({
        type: "update",
        id: task.id,
        data: buildUpdatePayload("CLOSED"),
      });
      router.refresh();
    } catch (err: any) {
      window.alert("Falha ao cancelar a tarefa: " + (err?.message || err));
    }
  };

  const handleImpediment = async () => {
    try {
      await taskMutation.mutateAsync({
        type: "update",
        id: task.id,
        data: buildUpdatePayload("IMPEDED"),
      });
      router.refresh();
    } catch (err: any) {
      window.alert("Falha ao registrar impedimento: " + (err?.message || err));
    }
  };

  const handleEdit = () => {
    router.push(`/panel/tasks/${task.id}/edit`);
  };

  const handleDownloadPdf = () => {
    const url = `/panel/tasks/${task.id}/pdf`;
    if (typeof window !== "undefined") {
      window.open(url, "_blank");
    }
  };

  const handleFinalize = async () => {
    try {
      await taskMutation.mutateAsync({
        type: "update",
        id: task.id,
        data: buildUpdatePayload("CLOSED"),
      });
      router.refresh();
    } catch (err: any) {
      window.alert("Falha ao finalizar a tarefa: " + (err?.message || err));
    }
  };

  return (
    <Box>
      <PageTitle
        title="Detalhe da Tarefa"
        onBack={handleBack}
        actions={[
          {
            key: "actions-menu",
            node: (
              <SplitActions
                primaryLabel="Ações"
                actions={[
                  {
                    key: "start",
                    label: "Iniciar",
                    onClick: handleStart,
                    visible: [
                      "PENDING",
                      "OPEN",
                      "SCHEDULED",
                      "EMERGENCY",
                      "APPROVED",
                      "EXPIRED",
                    ].includes(task.status),
                  },
                  {
                    key: "impediment",
                    label: "Impedimento",
                    onClick: handleImpediment,
                    visible: ["IN_PROGRESS"].includes(task.status),
                  },
                  {
                    key: "edit",
                    label: "Editar",
                    onClick: handleEdit,
                    visible: !["CLOSED"].includes(task.status),
                  },
                  {
                    key: "finalize",
                    label: "Finalizar",
                    onClick: handleFinalize,
                    visible: ["IN_PROGRESS"].includes(task.status),
                  },
                  {
                    key: "cancel",
                    label: "Cancelar",
                    onClick: handleCancel,
                    visible: !["CLOSED", "REJECTED"].includes(task.status),
                  },
                  {
                    key: "re-open",
                    label: "Reabrir",
                    onClick: handleCancel,
                    visible: ["CLOSED"].includes(task.status),
                  },
                  {
                    key: "resolved",
                    label: "Resolver impedimento",
                    onClick: handleCancel,
                    visible: ["IMPEDED"].includes(task.status),
                  },
                  {
                    key: "download",
                    label: "Baixar PDF",
                    onClick: handleDownloadPdf,
                    visible: true,
                  },
                ]}
              />
            ),
          },
        ]}
      />

      <Divider sx={{ my: 2 }} />

      <TaskDetailCard task={task} />
    </Box>
  );
};
