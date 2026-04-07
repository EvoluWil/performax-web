import { useTaskMutation } from '@/features/task/hooks';
import {
  TaskFormDto,
  taskFormInitialValues,
  taskFormSchema,
} from '@/features/task/schemas';
import { Task } from '@/features/task/types';
import { useUpload } from '@/hooks/common/upload';
import { useFormResources } from '@/hooks/use-form-resources';
import { File } from '@/types/file';
import { yupResolver } from '@hookform/resolvers/yup';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { formatChecklist } from '../../util/format-checklist';
import { TaskDrawerProps } from './task';

export const useTaskDrawer = ({
  onClose,
  open,
  task: selectedTask,
  onSuccess,
}: TaskDrawerProps) => {
  const [task, setTask] = useState<Task | null>(selectedTask || null);
  const taskMutation = useTaskMutation();
  const { sendFiles, deleteFile } = useUpload();

  const { options, setSearch } = useFormResources([
    'clients',
    'taskTypes',
    'users',
  ]);

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

    if (!task) {
      delete data.impedimentNote;
    }

    const result = await taskMutation.mutateAsync({
      type: task ? 'update' : 'create',
      data: data,
      id: task?.id,
    });

    if (result) {
      toast.success(
        task ? 'OS atualizada com sucesso' : 'OS criada com sucesso',
      );
      handleClose();
      onClose();
      if (onSuccess) onSuccess();
    }
  });

  const handleRemoveDefaultFile = async (file: File) => {
    try {
      const result = await taskMutation.mutateAsync({
        type: 'update',
        data: {
          files: task?.files?.filter((f) => f.url !== file.url) || [],
        } as TaskFormDto,
        id: task?.id,
      });
      if (result) {
        await deleteFile(file?.url || '');
        setTask(
          (prev) =>
            ({
              ...prev,
              files: prev?.files?.filter((f) => f.url !== file.url) || [],
            }) as Task,
        );
        toast.success('Arquivo removido com sucesso');
      }
    } catch {
      toast.error('Erro ao remover arquivo');
    }
  };

  const handleClose = () => {
    onClose();
    reset();
  };

  useEffect(() => {
    if (task) {
      reset({
        title: task?.title || '',
        description: task?.description || '',
        date: (new Date(task?.date) as any) || '',
        value: task?.value || 0,
        clientId: task?.client?.id || '',
        typeId: task?.type?.id || '',
        internalNote: task?.internalNote || '',
        responsibleId: task?.responsible?.id || '',
        status: task?.status || '',
        recurrence: task?.recurrence || '',
        checklist: formatChecklist(task?.checklist) || undefined,
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
    setSearch,
    defaultFiles: task?.files || [],
    editing: !!task,
    hasRecurrence: !!task?.recurrence || task?.recurrenceMasterId,
    handleRemoveDefaultFile,
  };
};
