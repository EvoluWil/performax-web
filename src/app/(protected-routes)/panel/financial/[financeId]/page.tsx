import { FinanceDetail } from '@/features/financial/pages';
import { financeService } from '@/features/financial/services/finance.service';
import { QueryClient } from '@tanstack/react-query';

type Props = {
  params: Promise<{ financeId: string }>;
};

export default async function FinanceDetailPage({ params }: Props) {
  const { financeId } = await params;
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ['finance-detail', financeId],
    queryFn: () => financeService.getById(financeId),
  });

  return <FinanceDetail />;
}
