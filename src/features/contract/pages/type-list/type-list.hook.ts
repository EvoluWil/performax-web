import { useState } from 'react';
import { toast } from 'react-toastify';
import swal from 'sweetalert2';
import {
  useContractTypeMutation,
  useContractTypesQuery,
} from '../../hooks/queries/contract-types.query';
import { ContractType } from '../../types/contract-type';

export const useContractTypeList = () => {
  const { data: contractTypes, refetch } = useContractTypesQuery();

  const [openModal, setOpenModal] = useState(false);
  const [selectedContractType, setSelectedContractType] =
    useState<ContractType | null>(null);
  const [term, setTerm] = useState('');

  const mutation = useContractTypeMutation();

  const handleOpenAdd = async () => setOpenModal(true);
  const handleCloseAdd = () => {
    setOpenModal(false);
    setSelectedContractType(null);
  };

  const handleSelectContractTypeToEdit = (item: ContractType) => {
    setSelectedContractType(item);
    setOpenModal(true);
  };

  const handleDeleteContractType = async (id: string) => {
    swal.fire({
      title: 'Tem certeza que deseja excluir este tipo de contrato?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sim, excluir',
      cancelButtonText: 'Cancelar',
      preConfirm: async () => {
        const result = await mutation.mutateAsync({ type: 'delete', id });
        if (result) toast.success('Tipo de contrato excluído com sucesso');
      },
    });
  };

  const handleReload = async () => {
    const { data } = await refetch();
    if (data) toast.success('Dados atualizados com sucesso');
  };

  const handleSearch = async (search: string) => setTerm(search);

  const filtered = contractTypes?.filter((t) =>
    t.name?.toLowerCase().includes(term.toLowerCase()),
  );

  return {
    contractTypes: filtered,
    openModal,
    selectedContractType,
    handleOpenAdd,
    handleReload,
    handleSearch,
    handleCloseAdd,
    handleDeleteContractType,
    handleSelectContractTypeToEdit,
  };
};
