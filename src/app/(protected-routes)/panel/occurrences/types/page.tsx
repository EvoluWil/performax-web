import { OccurrenceTypeList } from '@/features/occurrence/pages';
import { occurrenceTypeService } from '@/features/occurrence/services';
import { QueryClient } from '@tanstack/react-query';

export default async function OccurrenceTypesPage() {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ['occurrence-types'],
    queryFn: () => occurrenceTypeService.get(),
  });

  return <OccurrenceTypeList />;
}
