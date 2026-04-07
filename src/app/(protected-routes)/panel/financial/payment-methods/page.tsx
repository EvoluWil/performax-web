import { FinancePaymentMethodList } from '@/features/financial/pages';
import { financePaymentMethodService } from '@/features/financial/services/finance-payment-method.service';
import { QueryClient } from '@tanstack/react-query';

export default async function FinancialPaymentMethodsPage() {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ['finance-payment-methods'],
    queryFn: () => financePaymentMethodService.getAll(),
  });

  return <FinancePaymentMethodList />;
}
