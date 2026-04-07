import { FinanceBankList } from '@/features/financial/pages';
import { financeBankService } from '@/features/financial/services/finance-bank.service';
import { QueryClient } from '@tanstack/react-query';

export default async function FinancialBanksPage() {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ['finance-banks'],
    queryFn: () => financeBankService.getAll(),
  });

  return <FinanceBankList />;
}
