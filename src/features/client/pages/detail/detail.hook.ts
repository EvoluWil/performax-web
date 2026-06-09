'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import swal from 'sweetalert2';
import {
  useClientDetailQuery,
  useClientMutation,
} from '../../hooks/queries/client.query';

export const useClientDetail = () => {
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [contractsModalOpen, setContractsModalOpen] = useState(false);

  const { clientId } = useParams();
  const { replace } = useRouter();

  const {
    data: client,
    error,
    refetch,
    isRefetching,
  } = useClientDetailQuery(String(clientId));

  const clientMutation = useClientMutation();

  const handleBack = () => {
    if (typeof window !== 'undefined') window.history.back();
  };

  const toggleEditModal = (newValue: boolean) => setEditModalOpen(newValue);
  const toggleContractsModal = () => setContractsModalOpen((prev) => !prev);

  const handleDelete = async () => {
    if (!client) return;

    swal.fire({
      title: 'Tem certeza que deseja excluir este cliente?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sim, excluir',
      cancelButtonText: 'Cancelar',
      preConfirm: async () => {
        await clientMutation.mutateAsync({ type: 'delete', id: client.id });
        toast.success('Cliente excluído com sucesso');
        replace('/panel/clients');
      },
    });
  };

  useEffect(() => {
    if (error) replace('/panel/clients');
  }, [error, replace]);

  return {
    client,
    loading: clientMutation.isPending || isRefetching,
    editModalOpen,
    contractsModalOpen,
    handleBack,
    toggleEditModal,
    toggleContractsModal,
    handleDelete,
    refetch,
  };
};
