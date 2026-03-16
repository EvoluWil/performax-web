import {
  useOccurrenceTypeMutation,
  useOccurrenceTypesQuery,
} from '@/features/occurrence/hooks';
import { OccurrenceType } from '@/features/occurrence/types';
import { useState } from 'react';
import { toast } from 'react-toastify';
import swal from 'sweetalert2';

export const useOccurrenceTypeList = () => {
  const { data: occurrenceTypes, refetch } = useOccurrenceTypesQuery();

  const [openModal, setOpenModal] = useState(false);
  const [selectedOccurrenceType, setSelectedOccurrenceType] =
    useState<OccurrenceType | null>(null);
  const [term, setTerm] = useState('');

  const occurrenceTypeMutation = useOccurrenceTypeMutation();

  const handleOpenAdd = async () => {
    setOpenModal(true);
  };

  const handleCloseAdd = () => {
    setOpenModal(false);
    setSelectedOccurrenceType(null);
  };

  const handleSelectOccurrenceTypeToEdit = (occurrenceType: OccurrenceType) => {
    setSelectedOccurrenceType(occurrenceType);
    setOpenModal(true);
  };

  const handleDeleteOccurrenceType = async (occurrenceTypeId: string) => {
    swal.fire({
      title: 'Tem certeza que deseja excluir este tipo de ocorrência?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sim, excluir',
      cancelButtonText: 'Cancelar',
      preConfirm: async () => {
        const result = await occurrenceTypeMutation.mutateAsync({
          type: 'delete',
          id: occurrenceTypeId,
        });

        if (result) {
          toast.success('Tipo de ocorrência excluído com sucesso');
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

  const filteredOccurrenceTypes = occurrenceTypes?.filter((occurrenceType) =>
    occurrenceType.name?.toLowerCase().includes(term.toLowerCase()),
  );

  return {
    occurrenceTypes: filteredOccurrenceTypes,
    openModal,
    selectedOccurrenceType,
    handleOpenAdd,
    handleReload,
    handleSearch,
    handleCloseAdd,
    handleDeleteOccurrenceType,
    handleSelectOccurrenceTypeToEdit,
  };
};
