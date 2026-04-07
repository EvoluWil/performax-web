import { FinanceSegmentList } from '@/features/financial/pages';
import { financeSegmentService } from '@/features/financial/services/finance-segment.service';
import { QueryClient } from '@tanstack/react-query';

export default async function FinancialSegmentsPage() {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ['financeSegments'],
    queryFn: () => financeSegmentService.getAll(),
  });

  return <FinanceSegmentList />;
}
