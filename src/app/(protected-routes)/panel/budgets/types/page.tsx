import { BudgetTypeList } from "@/features/budget/pages";
import { budgetTypeService } from "@/features/budget/services/budget-type.service";

import { QueryClient } from "@tanstack/react-query";

export default async function BudgetTypesPage() {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["budget-types"],
    queryFn: () => budgetTypeService.get(),
  });

  return <BudgetTypeList />;
}
