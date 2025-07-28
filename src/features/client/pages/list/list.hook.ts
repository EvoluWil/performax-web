import { useClientMutation, useClientsQuery } from '@/features/client/hooks';
import { Client } from '@/features/client/types';
import { useState } from 'react';
import { toast } from 'react-toastify';
import swal from 'sweetalert2';

export const useClientList = () => {
  const {
    data: { data: clients },
    refetch,
  } = useClientsQuery();
  console.log('clients', clients);
  const [openModal, setOpenModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [term, setTerm] = useState('');

  const clientMutation = useClientMutation();

  const handleOpenAdd = async () => {
    setOpenModal(true);
  };

  const handleCloseAdd = () => {
    setOpenModal(false);
    setSelectedClient(null);
  };

  const handleSelectClientToEdit = (client: Client) => {
    setSelectedClient(client);
    setOpenModal(true);
  };

  const handleDeleteClient = async (clientId: string) => {
    swal.fire({
      title: 'Tem certeza que deseja excluir este cliente?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sim, excluir',
      cancelButtonText: 'Cancelar',
      preConfirm: async () => {
        const result = await clientMutation.mutateAsync({
          type: 'delete',
          id: clientId,
        });

        if (result) {
          toast.success('Cliente excluído com sucesso');
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

  const filteredClients = clients?.filter(
    (client) =>
      client.name?.toLowerCase().includes(term.toLowerCase()) ||
      client.cnpj?.toLowerCase().includes(term.toLowerCase()) ||
      client.address?.toLowerCase().includes(term.toLowerCase()),
  );

  return {
    clients: filteredClients,
    openModal,
    selectedClient,
    handleOpenAdd,
    handleReload,
    handleSearch,
    handleCloseAdd,
    handleDeleteClient,
    handleSelectClientToEdit,
  };
};
