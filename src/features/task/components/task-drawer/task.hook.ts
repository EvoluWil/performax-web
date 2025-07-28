import { useTaskMutation } from '@/features/task/hooks';
import {
  TaskFormDto,
  taskFormInitialValues,
  taskFormSchema,
} from '@/features/task/schemas';
import { yupResolver } from '@hookform/resolvers/yup';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { TaskDrawerProps } from './task';

export const useTaskDrawer = ({ onClose, open, task }: TaskDrawerProps) => {
  const taskMutation = useTaskMutation();

  const { control, handleSubmit, reset } = useForm<TaskFormDto>({
    defaultValues: taskFormInitialValues,
    resolver: yupResolver(taskFormSchema),
  });

  const handleTask = handleSubmit(async (data: TaskFormDto) => {
    const result = await taskMutation.mutateAsync({
      type: task ? 'update' : 'create',
      data: data,
      id: task?.id,
    });

    if (result) {
      toast.success(
        task ? 'Tarefa atualizada com sucesso' : 'Tarefa criada com sucesso',
      );
      handleClose();
      onClose();
    }
  });

  const handleClose = () => {
    onClose();
    reset();
  };

  useEffect(() => {
    if (task) {
      reset({
        title: task?.title || '',
        description: task?.description || '',
        date: String(task?.date) || '',
        clientId: task?.clientId || '',
        typeId: task?.typeId || '',
        internalNote: task?.internalNote || '',
        responsibleId: task?.responsibleId || '',
        status: task?.status || '',
        files: task?.files || [],
      });
    } else {
      reset(taskFormInitialValues);
    }
  }, [task, reset]);

  return {
    control,
    handleTask,
    loading: taskMutation.isPending,
    handleClose,
    open,
    editing: !!task,
  };
};
