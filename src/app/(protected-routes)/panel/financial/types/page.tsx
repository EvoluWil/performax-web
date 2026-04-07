import { FinanceTypeList } from '@/features/financial/pages';
import { financeTypeService } from '@/features/financial/services/finance-type.service';
import { QueryClient } from '@tanstack/react-query';

export default async function FinancialTypesPage() {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ['finance-types'],
    queryFn: () => financeTypeService.getAll(),
  });

  return <FinanceTypeList />;
}
