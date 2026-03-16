import { OccurrenceList } from '@/features/occurrence/pages';
import { occurrenceService } from '@/features/occurrence/services';
import { QueryClient } from '@tanstack/react-query';

export default async function OccurrencesPage() {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ['occurrences'],
    queryFn: () => occurrenceService.get(),
  });

  return <OccurrenceList />;
}
