import { UserList } from '@/features/user/pages';
import { userService } from '@/features/user/services';
import { QueryClient } from '@tanstack/react-query';

export default async function UsersPage() {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ['users'],
    queryFn: () => userService.get(),
  });

  return <UserList />;
}
