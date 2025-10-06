import { BudgetList } from "@/features/budget/pages";
import { budgetService } from "@/features/budget/services/budget.service";
import { QueryClient } from "@tanstack/react-query";

export default async function BudgetsPage() {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["budgets"],
    queryFn: () => budgetService.get(),
  });

  return <BudgetList />;
}
