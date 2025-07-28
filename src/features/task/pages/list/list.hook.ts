import { useTaskMutation, useTasksQuery } from '@/features/task/hooks';
import { Task } from '@/features/task/types';
import { useState } from 'react';
import { toast } from 'react-toastify';
import swal from 'sweetalert2';

export const useTaskList = () => {
  const {
    data: { data: tasks },
    refetch,
  } = useTasksQuery();
  console.log('tasks', tasks);
  const [openModal, setOpenModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [term, setTerm] = useState('');

  const taskMutation = useTaskMutation();

  const handleOpenAdd = async () => {
    setOpenModal(true);
  };

  const handleCloseAdd = () => {
    setOpenModal(false);
    setSelectedTask(null);
  };

  const handleSelectTaskToEdit = (task: Task) => {
    setSelectedTask(task);
    setOpenModal(true);
  };

  const handleDeleteTask = async (taskId: string) => {
    swal.fire({
      title: 'Tem certeza que deseja excluir esta tarefa?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sim, excluir',
      cancelButtonText: 'Cancelar',
      preConfirm: async () => {
        const result = await taskMutation.mutateAsync({
          type: 'delete',
          id: taskId,
        });

        if (result) {
          toast.success('Tarefa excluída com sucesso');
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

  const filteredTasks = tasks?.filter(
    (task) =>
      task.title?.toLowerCase().includes(term.toLowerCase()) ||
      task.description?.toLowerCase().includes(term.toLowerCase()) ||
      task.protocol?.toLowerCase().includes(term.toLowerCase()),
  );

  return {
    tasks: filteredTasks,
    openModal,
    selectedTask,
    handleOpenAdd,
    handleReload,
    handleSearch,
    handleCloseAdd,
    handleDeleteTask,
    handleSelectTaskToEdit,
  };
};
