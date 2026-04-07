import { FinanceCategoryList } from '@/features/financial/pages';
import { financeCategoryService } from '@/features/financial/services/finance-category.service';
import { QueryClient } from '@tanstack/react-query';

export default async function FinancialCategoriesPage() {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ['finance-categories'],
    queryFn: () => financeCategoryService.getAll(),
  });

  return <FinanceCategoryList />;
}
