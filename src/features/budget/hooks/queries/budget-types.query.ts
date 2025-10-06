import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BudgetTypeFormDto } from "../../schemas/budget-type.schema";
import { budgetTypeService } from "../../services/budget-type.service";
import { BudgetType } from "../../types/budget-type";

type BudgetTypeMutationInput = {
  type: "create" | "update" | "delete";
  id?: string;
  data?: BudgetTypeFormDto;
};

export function useBudgetTypesQuery() {
  return useQuery({
    queryKey: ["budgetTypes"],
    queryFn: async () => budgetTypeService.get(),
    initialData: [],
    refetchOnWindowFocus: false,
  });
}

export const useBudgetTypeMutation = () => {
  const queryClient = useQueryClient();

  const mutationFn = async (
    input: BudgetTypeMutationInput
  ): Promise<BudgetType> => {
    switch (input.type) {
      case "create":
        return budgetTypeService.create(input?.data as BudgetTypeFormDto);
      case "update":
        return budgetTypeService.update(
          input?.id as string,
          input?.data as BudgetTypeFormDto
        );
      case "delete":
        return budgetTypeService.delete(input?.id as string);
    }
  };

  return useMutation<BudgetType, Error, BudgetTypeMutationInput>({
    mutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgetTypes"] });
    },
  });
};
