import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { BudgetFormDto } from "../../schemas/budget-drawer.schema";
import { budgetService } from "../../services/budget.service";
import type { Budget } from "../../types/budget";

export function useBudgetsQuery() {
  return useQuery({
    queryKey: ["budgets"],
    queryFn: async () => budgetService.get(),
    initialData: { count: 0, data: [] },
    refetchOnWindowFocus: false,
  });
}

export function useBudgetDetailQuery(budgetId: string) {
  return useQuery({
    queryKey: ["budget-detail", budgetId],
    queryFn: async () => budgetService.getById(budgetId),
    enabled: !!budgetId,
    refetchOnWindowFocus: false,
  });
}

type BudgetMutationInput = {
  type: "create" | "update" | "delete";
  id?: string;
  data?: Partial<BudgetFormDto>;
};

export const useBudgetMutation = (budgetId?: string) => {
  const queryClient = useQueryClient();

  const mutationFn = async (input: BudgetMutationInput): Promise<Budget> => {
    switch (input.type) {
      case "create":
        return budgetService.create(input?.data as any);
      case "update":
        return budgetService.update(input?.id as string, input?.data as any);
      case "delete":
        return budgetService.delete(input?.id as string);
    }
  };

  const queryKey: (string | undefined)[] = [
    "budgets",
    "budget-detail",
    budgetId,
  ];

  return useMutation<Budget, Error, BudgetMutationInput>({
    mutationFn,
    onSuccess: () => {
      // invalidate list and optionally a detail
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      queryClient.invalidateQueries({
        queryKey: queryKey.filter(Boolean) as string[],
      });
    },
  });
};
