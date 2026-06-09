import { FinanceAdvanceList } from '@/features/financial/pages';
import { financeAdvanceService } from '@/features/financial/services/finance-advance.service';
import { QueryClient } from '@tanstack/react-query';

export default async function FinancialAdvancesPage() {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ['financeAdvances'],
    queryFn: () => financeAdvanceService.getAll(),
  });

  return <FinanceAdvanceList />;
}
