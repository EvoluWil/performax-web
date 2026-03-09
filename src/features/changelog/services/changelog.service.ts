import { api } from '@/config/api';
import { Changelog } from '@/features/changelog/types';

class ChangelogService {
  private path = 'changelog';

  async getAll(): Promise<Changelog[]> {
    const { data } = await api.get<Changelog[]>(this.path);
    return data ?? [];
  }
}

export const changelogService = new ChangelogService();
