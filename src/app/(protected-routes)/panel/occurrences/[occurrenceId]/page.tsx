import { OccurrenceDetail } from '@/features/occurrence/pages';
import { occurrenceService } from '@/features/occurrence/services';
import { QueryClient } from '@tanstack/react-query';

type Props = {
  params: Promise<{ occurrenceId: string }>;
};

export default async function OccurrenceDetailPage({ params }: Props) {
  const { occurrenceId } = await params;
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ['occurrence-detail', occurrenceId],
    queryFn: () => occurrenceService.getById(occurrenceId),
  });

  return <OccurrenceDetail />;
}
