import { FinanceList } from '@/features/financial/pages';
import { financeService } from '@/features/financial/services/finance.service';
import { QueryClient } from '@tanstack/react-query';

export default async function FinancialPage() {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ['finances'],
    queryFn: () => financeService.get(),
  });

  return <FinanceList />;
}
