import { changelogService } from '@/features/changelog/services';
import { useQuery } from '@tanstack/react-query';

export const CHANGELOG_QUERY_KEY = 'changelog';

export function useChangelogQuery() {
  return useQuery({
    queryKey: [CHANGELOG_QUERY_KEY],
    queryFn: () => changelogService.getAll(),
  });
}
