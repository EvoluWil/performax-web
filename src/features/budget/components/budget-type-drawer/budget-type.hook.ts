import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { useBudgetTypeMutation } from "../../hooks/queries/budget-types.query";
import {
  BudgetTypeFormDto,
  budgetTypeFormInitialValues,
  budgetTypeFormSchema,
} from "../../schemas/budget-type.schema";
import { BudgetTypeDrawerProps } from "./budget-type";

export const useBudgetTypeDrawer = ({
  onClose,
  open,
  budgetType,
}: BudgetTypeDrawerProps) => {
  const mutation = useBudgetTypeMutation();

  const { control, handleSubmit, reset } = useForm<BudgetTypeFormDto>({
    defaultValues: budgetTypeFormInitialValues,
    resolver: yupResolver(budgetTypeFormSchema),
  });

  const handleBudgetType = handleSubmit(async (data: BudgetTypeFormDto) => {
    const result = await mutation.mutateAsync({
      type: budgetType ? "update" : "create",
      data,
      id: budgetType?.id,
    });

    if (result) {
      toast.success(
        budgetType
          ? "Tipo de orçamento atualizado com sucesso"
          : "Tipo de orçamento criado com sucesso"
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
    if (budgetType) {
      reset({ name: budgetType.name, needApprove: budgetType.needApprove });
    } else {
      reset(budgetTypeFormInitialValues);
    }
  }, [budgetType, reset]);

  return {
    control,
    handleBudgetType,
    loading: mutation.isPending,
    handleClose,
    open,
    editing: !!budgetType,
  };
};
