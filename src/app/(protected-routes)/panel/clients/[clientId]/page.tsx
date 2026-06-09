import { ClientDetail } from '@/features/client/pages';
import { clientService } from '@/features/client/services/client.service';
import { QueryClient } from '@tanstack/react-query';

type Props = {
  params: Promise<{ clientId: string }>;
};

export default async function ClientDetailPage({ params }: Props) {
  const { clientId } = await params;
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ['client-detail', clientId],
    queryFn: () => clientService.getById(clientId),
  });

  return <ClientDetail />;
}
