import { useClientsQuery } from "@/features/client/hooks";
import { useTaskMutation, useTaskTypesQuery } from "@/features/task/hooks";
import {
  TaskFormDto,
  taskFormInitialValues,
  taskFormSchema,
} from "@/features/task/schemas";
import { Task } from "@/features/task/types";
import { useUsersQuery } from "@/features/user/hooks";
import { useUpload } from "@/hooks/common/upload";
import { File } from "@/types/file";
import { formatterSelectOptions } from "@/utils/select";
import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { TaskDrawerProps } from "./task";

export const useTaskDrawer = ({
  onClose,
  open,
  task: selectedTask,
  onSuccess,
}: TaskDrawerProps) => {
  const [task, setTask] = useState<Task | null>(selectedTask || null);
  const taskMutation = useTaskMutation();
  const { sendFiles, deleteFile } = useUpload();
  const {
    data: { data: clients },
  } = useClientsQuery();
  const { data: taskTypes } = useTaskTypesQuery();
  const {
    data: { data: users },
  } = useUsersQuery();

  const options = useMemo(() => {
    return {
      clients: formatterSelectOptions(clients, "id", "name"),
      types: formatterSelectOptions(taskTypes, "id", "name"),
      users: formatterSelectOptions(users, "id", "name"),
    };
  }, [clients, taskTypes, users]);

  const { control, handleSubmit, reset, setValue } = useForm<TaskFormDto>({
    defaultValues: taskFormInitialValues,
    resolver: yupResolver(taskFormSchema) as any,
  });

  const handleTask = handleSubmit(async (data: TaskFormDto) => {
    if (data.files && data.files.length > 0) {
      const files = await sendFiles(data.files as any, `tasks/${data.title}`);
      data.files = files;
    }

    if (!data.checklist || !data.checklist?.modules?.length) {
      data.checklist = undefined;
    }

    const result = await taskMutation.mutateAsync({
      type: task ? "update" : "create",
      data: data,
      id: task?.id,
    });

    console.log("result", result);

    if (result) {
      toast.success(
        task ? "Tarefa atualizada com sucesso" : "Tarefa criada com sucesso"
      );
      handleClose();
      onClose();
      if (onSuccess) onSuccess();
    }
  });

  const handleRemoveDefaultFile = async (file: File) => {
    try {
      const result = await taskMutation.mutateAsync({
        type: "update",
        data: {
          files: task?.files?.filter((f) => f.url !== file.url) || [],
        } as TaskFormDto,
        id: task?.id,
      });
      if (result) {
        await deleteFile(file?.url || "");
        setTask(
          (prev) =>
            ({
              ...prev,
              files: prev?.files?.filter((f) => f.url !== file.url) || [],
            } as Task)
        );
        toast.success("Arquivo removido com sucesso");
      }
    } catch {
      toast.error("Erro ao remover arquivo");
    }
  };

  const handleClose = () => {
    onClose();
    reset();
  };

  useEffect(() => {
    if (task) {
      reset({
        title: task?.title || "",
        description: task?.description || "",
        date: (new Date(task?.date) as any) || "",
        clientId: task?.client?.id || "",
        typeId: task?.type?.id || "",
        internalNote: task?.internalNote || "",
        responsibleId: task?.responsible?.id || "",
        status: task?.status || "",
      });
    } else {
      reset(taskFormInitialValues);
    }
  }, [task, reset]);

  return {
    control,
    setValue,
    handleTask,
    loading: taskMutation.isPending,
    handleClose,
    open,
    options,
    defaultFiles: task?.files || [],
    editing: !!task,
    handleRemoveDefaultFile,
  };
};
