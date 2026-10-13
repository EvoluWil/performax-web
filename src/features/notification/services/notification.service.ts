import { api } from '@/config/api';
import { BaseCompanyService } from '@/services/base-url.service';

export type NotificationDomain = 'TASK' | 'BUDGET' | 'OCCURRENCE' | 'FINANCE';

export type AppNotification = {
  id: string;
  domain: NotificationDomain;
  type: string;
  entityId: string;
  title: string;
  body: string;
  readAt: string | null;
  createdAt: string;
};

export type NotificationPage = {
  data: AppNotification[];
  nextCursor: string | null;
};

class NotificationService extends BaseCompanyService {
  async list(cursor?: string) {
    const { data } = await api.get<NotificationPage>(
      this.getUrlBase('notifications'),
      { params: { limit: 20, ...(cursor ? { cursor } : {}) } },
    );
    return data;
  }

  async unreadCount() {
    const { data } = await api.get<{ count: number }>(
      this.getUrlBase('notifications/unread-count'),
    );
    return data.count;
  }

  async markRead(id: string) {
    await api.put(this.getUrlBase(`notifications/${id}/read`));
  }

  async markAllRead() {
    await api.put(this.getUrlBase('notifications/read-all'));
  }
}

export const notificationService = new NotificationService();
