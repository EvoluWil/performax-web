import { useTaskTypeMutation, useTaskTypesQuery } from '@/features/task/hooks';
import { TaskType } from '@/features/task/types';
import { useState } from 'react';
import { toast } from 'react-toastify';
import swal from 'sweetalert2';

export const useTaskTypeList = () => {
  const { data: taskTypes, refetch } = useTaskTypesQuery();

  const [openModal, setOpenModal] = useState(false);
  const [selectedTaskType, setSelectedTaskType] = useState<TaskType | null>(
    null,
  );
  const [term, setTerm] = useState('');

  const taskTypeMutation = useTaskTypeMutation();

  const handleOpenAdd = async () => {
    setOpenModal(true);
  };

  const handleCloseAdd = () => {
    setOpenModal(false);
    setSelectedTaskType(null);
  };

  const handleSelectTaskTypeToEdit = (taskType: TaskType) => {
    setSelectedTaskType(taskType);
    setOpenModal(true);
  };

  const handleDeleteTaskType = async (taskTypeId: string) => {
    swal.fire({
      title: 'Tem certeza que deseja excluir este tipo de OS?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sim, excluir',
      cancelButtonText: 'Cancelar',
      preConfirm: async () => {
        const result = await taskTypeMutation.mutateAsync({
          type: 'delete',
          id: taskTypeId,
        });

        if (result) {
          toast.success('Tipo de OS excluído com sucesso');
        }
      },
    });
  };

  const handleReload = async () => {
    const { data } = await refetch();
    if (data) {
      toast.success('Dados atualizados com sucesso');
    }
  };

  const handleSearch = async (search: string) => {
    setTerm(search);
  };

  const filteredTaskTypes = taskTypes?.filter((taskType) =>
    taskType.name?.toLowerCase().includes(term.toLowerCase()),
  );

  return {
    taskTypes: filteredTaskTypes,
    openModal,
    selectedTaskType,
    handleOpenAdd,
    handleReload,
    handleSearch,
    handleCloseAdd,
    handleDeleteTaskType,
    handleSelectTaskTypeToEdit,
  };
};
