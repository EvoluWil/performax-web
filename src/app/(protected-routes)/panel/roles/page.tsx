import { RoleList } from '@/features/role/pages';
import { roleService } from '@/features/role/services';
import { QueryClient } from '@tanstack/react-query';

export default async function RolesPage() {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ['roles'],
    queryFn: () => roleService.get(),
  });

  return <RoleList />;
}
