import { Pagination } from '@/components/common/table/table';
import { useClientMutation, useClientsQuery } from '@/features/client/hooks';
import { Client } from '@/features/client/types';
import { useCompanyPermissions } from '@/hooks/common/permission';
import { useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import swal from 'sweetalert2';

export const useClientList = () => {
  const { getScopedUserIds } = useCompanyPermissions();

  const scopedClientIds = useMemo(
    () => getScopedUserIds('client'),
    [getScopedUserIds],
  );

  const hasClientAccess =
    scopedClientIds === null || scopedClientIds.length > 0;

  const [openModal, setOpenModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [term, setTerm] = useState('');
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 30 });

  const { data, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useClientsQuery({
      scopeModule: 'client',
      pageSize: pagination.pageSize,
    });

  const clients = data?.clients ?? [];
  const count = data?.count ?? 0;

  const clientMutation = useClientMutation();

  const handleOpenAdd = () => {
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
    if (!hasClientAccess) {
      toast.info('Você não possui permissão para visualizar clientes.');
      return;
    }

    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    const { data } = await refetch();

    if (data) {
      toast.success('Dados atualizados com sucesso');
    }
  };

  const handleSearch = (search: string) => {
    setTerm(search);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  const handlePaginationChange = async (newPagination: Pagination) => {
    if (JSON.stringify(newPagination) === JSON.stringify(pagination)) {
      return;
    }

    if (newPagination.pageIndex === pagination.pageIndex) {
      setPagination((prev) => ({ ...prev, pageSize: newPagination.pageSize }));
      return;
    }

    const requiredCount =
      (newPagination.pageIndex + 1) * newPagination.pageSize;

    setPagination(newPagination);

    if (clients.length < requiredCount && hasNextPage && !isFetchingNextPage) {
      await fetchNextPage();
    }
  };

  const filteredClients = (hasClientAccess ? clients : []).filter(
    (client) =>
      client.name?.toLowerCase().includes(term.toLowerCase()) ||
      client.cnpj?.toLowerCase().includes(term.toLowerCase()) ||
      client.address?.toLowerCase().includes(term.toLowerCase()),
  );

  const paginatedClients = filteredClients.slice(
    pagination.pageIndex * pagination.pageSize,
    (pagination.pageIndex + 1) * pagination.pageSize,
  );

  return {
    clients: paginatedClients,
    openModal,
    selectedClient,
    handleOpenAdd,
    handleReload,
    handleSearch,
    handleCloseAdd,
    handleDeleteClient,
    handleSelectClientToEdit,
    pagination,
    handlePaginationChange,
    count,
  };
};
