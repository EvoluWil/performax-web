import { ClientList } from '@/features/client/pages';
import { clientService } from '@/features/client/services';
import { QueryClient } from '@tanstack/react-query';

export default async function ClientsPage() {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ['clients'],
    queryFn: () => clientService.get(),
  });

  return <ClientList />;
}
