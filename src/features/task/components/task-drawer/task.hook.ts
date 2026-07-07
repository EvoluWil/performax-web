import { Client } from '@/features/client/types';
import { useTaskMutation } from '@/features/task/hooks';
import {
  TaskFormDto,
  taskFormInitialValues,
  taskFormSchema,
} from '@/features/task/schemas';
import { Task } from '@/features/task/types';
import { useCompanyPermissions } from '@/hooks/common/permission';
import { useUpload } from '@/hooks/common/upload';
import { useCompanyGroupQuery } from '@/hooks/queries/company-group.query';
import { useFormResources } from '@/hooks/use-form-resources';
import { companyService } from '@/services/company.service';
import { Company } from '@/types/company';
import { File } from '@/types/file';
import { yupResolver } from '@hookform/resolvers/yup';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { TaskType } from '../../types';
import { formatChecklist } from '../../util/format-checklist';
import { TaskDrawerProps } from './task';

export const useTaskDrawer = ({
  onClose,
  open,
  task: selectedTask,
  onSuccess,
}: TaskDrawerProps) => {
  const { hasPermission } = useCompanyPermissions();
  const [task, setTask] = useState<Task | null>(selectedTask || null);
  const taskMutation = useTaskMutation();
  const { sendFiles, deleteFile } = useUpload();

  const defaultCompanyId = companyService.getDefaultCompany()?.id;
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>(
    defaultCompanyId || '',
  );
  const { data: companyGroup } = useCompanyGroupQuery(defaultCompanyId);
  const companyOptions = useMemo(
    () =>
      (companyGroup?.companies ?? []).map((c) => ({
        value: c.id,
        label: c.name,
      })),
    [companyGroup],
  );

  const { options, setSearch } = useFormResources(
    ['clients', 'taskTypes', 'users'],
    selectedCompanyId,
  );

  const canCreateClient = hasPermission('client', 'write');
  const canCreateTaskType = hasPermission('register', 'write');

  const [clientDrawerOpen, setClientDrawerOpen] = useState(false);
  const [clientInitialName, setClientInitialName] = useState('');
  const [taskTypeDrawerOpen, setTaskTypeDrawerOpen] = useState(false);
  const [taskTypeInitialName, setTaskTypeInitialName] = useState('');

  const clientCreateRef = useRef<{
    resolve: (id: string) => void;
    reject: (error: Error) => void;
  } | null>(null);

  const taskTypeCreateRef = useRef<{
    resolve: (id: string) => void;
    reject: (error: Error) => void;
  } | null>(null);

  const handleOpenCreateClient = (label: string) => {
    setClientInitialName(label);
    setClientDrawerOpen(true);

    return new Promise<string>((resolve, reject) => {
      clientCreateRef.current = { resolve, reject };
    });
  };

  const handleCloseClientDrawer = () => {
    setClientDrawerOpen(false);
    setClientInitialName('');

    if (clientCreateRef.current) {
      clientCreateRef.current.reject(new Error('cancelled'));
      clientCreateRef.current = null;
    }
  };

  const handleClientCreated = (client: Client) => {
    clientCreateRef.current?.resolve(client.id);
    clientCreateRef.current = null;
    setClientDrawerOpen(false);
    setClientInitialName('');
  };

  const handleOpenCreateTaskType = (label: string) => {
    setTaskTypeInitialName(label);
    setTaskTypeDrawerOpen(true);

    return new Promise<string>((resolve, reject) => {
      taskTypeCreateRef.current = { resolve, reject };
    });
  };

  const handleCloseTaskTypeDrawer = () => {
    setTaskTypeDrawerOpen(false);
    setTaskTypeInitialName('');

    if (taskTypeCreateRef.current) {
      taskTypeCreateRef.current.reject(new Error('cancelled'));
      taskTypeCreateRef.current = null;
    }
  };

  const handleTaskTypeCreated = (taskType: TaskType) => {
    taskTypeCreateRef.current?.resolve(taskType.id);
    taskTypeCreateRef.current = null;
    setTaskTypeDrawerOpen(false);
    setTaskTypeInitialName('');
  };

  const { control, handleSubmit, reset, setValue } = useForm<TaskFormDto>({
    defaultValues: taskFormInitialValues,
    resolver: yupResolver(taskFormSchema) as any,
  });

  const handleTask = handleSubmit(async (data: TaskFormDto) => {
    const originalCompany = companyService.getDefaultCompany();
    if (selectedCompanyId && selectedCompanyId !== originalCompany?.id) {
      const picked = companyGroup?.companies.find(
        (c) => c.id === selectedCompanyId,
      );
      if (picked)
        companyService.setDefaultCompany({ ...picked, ownerId: '' } as Company);
    }
    try {
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
    } finally {
      if (originalCompany) companyService.setDefaultCompany(originalCompany);
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
    canCreateClient,
    canCreateTaskType,
    handleOpenCreateClient,
    handleOpenCreateTaskType,
    clientDrawerOpen,
    taskTypeDrawerOpen,
    clientInitialName,
    taskTypeInitialName,
    handleCloseClientDrawer,
    handleCloseTaskTypeDrawer,
    handleClientCreated,
    handleTaskTypeCreated,
    defaultFiles: task?.files || [],
    editing: !!task,
    hasRecurrence: !!task?.recurrence || task?.recurrenceMasterId,
    handleRemoveDefaultFile,
    companyOptions,
    selectedCompanyId,
    setSelectedCompanyId,
  };
};
