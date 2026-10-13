import { api } from '@/config/api';
import { BaseCompanyService } from '@/services/base-url.service';
import { DashboardResponse } from '@/features/dashboard/types/dashboard';

class DashboardService extends BaseCompanyService {
  async get(month: string) {
    const { data } = await api.get<DashboardResponse>(
      this.getUrlBase('dashboard'),
      { params: { month } },
    );
    return data;
  }
}

export const dashboardService = new DashboardService();
