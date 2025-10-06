import { useState } from "react";
import { toast } from "react-toastify";
import swal from "sweetalert2";
import {
  useBudgetTypeMutation,
  useBudgetTypesQuery,
} from "../../hooks/queries/budget-types.query";
import { BudgetType } from "../../types/budget-type";

export const useBudgetTypeList = () => {
  const { data: budgetTypes, refetch } = useBudgetTypesQuery();

  const [openModal, setOpenModal] = useState(false);
  const [selectedBudgetType, setSelectedBudgetType] =
    useState<BudgetType | null>(null);
  const [term, setTerm] = useState("");

  const mutation = useBudgetTypeMutation();

  const handleOpenAdd = async () => setOpenModal(true);
  const handleCloseAdd = () => {
    setOpenModal(false);
    setSelectedBudgetType(null);
  };

  const handleSelectBudgetTypeToEdit = (item: BudgetType) => {
    setSelectedBudgetType(item);
    setOpenModal(true);
  };

  const handleDeleteBudgetType = async (id: string) => {
    swal.fire({
      title: "Tem certeza que deseja excluir este tipo de orçamento?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sim, excluir",
      cancelButtonText: "Cancelar",
      preConfirm: async () => {
        const result = await mutation.mutateAsync({ type: "delete", id });
        if (result) toast.success("Tipo de orçamento excluído com sucesso");
      },
    });
  };

  const handleReload = async () => {
    const { data } = await refetch();
    if (data) toast.success("Dados atualizados com sucesso");
  };

  const handleSearch = async (search: string) => setTerm(search);

  const filtered = budgetTypes?.filter((t) =>
    t.name?.toLowerCase().includes(term.toLowerCase())
  );

  return {
    budgetTypes: filtered,
    openModal,
    selectedBudgetType,
    handleOpenAdd,
    handleReload,
    handleSearch,
    handleCloseAdd,
    handleDeleteBudgetType,
    handleSelectBudgetTypeToEdit,
  };
};
