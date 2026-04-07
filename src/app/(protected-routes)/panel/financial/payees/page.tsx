import { FinancePayeeList } from '@/features/financial/pages';
import { financePayeeService } from '@/features/financial/services/finance-payee.service';
import { QueryClient } from '@tanstack/react-query';

export default async function FinancialPayeesPage() {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ['finance-payees'],
    queryFn: () => financePayeeService.getAll(),
  });

  return <FinancePayeeList />;
}
