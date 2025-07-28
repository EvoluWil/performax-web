import { useTaskTypeMutation } from '@/features/task/hooks';
import {
  TaskTypeFormDto,
  taskTypeFormInitialValues,
  taskTypeFormSchema,
} from '@/features/task/schemas';
import { yupResolver } from '@hookform/resolvers/yup';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { TaskTypeDrawerProps } from './task-type';

export const useTaskTypeDrawer = ({
  onClose,
  open,
  taskType,
}: TaskTypeDrawerProps) => {
  const taskTypeMutation = useTaskTypeMutation();

  const { control, handleSubmit, reset } = useForm<TaskTypeFormDto>({
    defaultValues: taskTypeFormInitialValues,
    resolver: yupResolver(taskTypeFormSchema),
  });

  const handleTaskType = handleSubmit(async (data: TaskTypeFormDto) => {
    const result = await taskTypeMutation.mutateAsync({
      type: taskType ? 'update' : 'create',
      data: data,
      id: taskType?.id,
    });

    if (result) {
      toast.success(
        taskType
          ? 'Tipo de tarefa atualizado com sucesso'
          : 'Tipo de tarefa criado com sucesso',
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
    if (taskType) {
      reset({
        name: taskType.name,
        needApprove: taskType.needApprove,
      });
    } else {
      reset(taskTypeFormInitialValues);
    }
  }, [taskType, reset]);

  return {
    control,
    handleTaskType,
    loading: taskTypeMutation.isPending,
    handleClose,
    open,
    editing: !!taskType,
  };
};
