import { BudgetDetail } from "@/features/budget/pages";
import { budgetService } from "@/features/budget/services/budget.service";
import { QueryClient } from "@tanstack/react-query";

type Props = {
  params: Promise<{ budgetId: string }>;
};

export default async function BudgetDetailPage({ params }: Props) {
  const { budgetId } = await params;
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["budget-detail", budgetId],
    queryFn: () => budgetService.getById(budgetId),
  });

  return <BudgetDetail />;
}
