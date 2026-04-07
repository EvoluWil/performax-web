import { FinanceRecurringList } from '@/features/financial/pages';
import { financeRecurringService } from '@/features/financial/services/finance-recurring.service';
import { QueryClient } from '@tanstack/react-query';

export default async function FinancialRecurringPage() {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ['finance-recurrings'],
    queryFn: () => financeRecurringService.getAll(),
  });

  return <FinanceRecurringList />;
}
