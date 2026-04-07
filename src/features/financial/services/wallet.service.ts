import { api } from '@/config/api';
import { BaseCompanyService } from '@/services/base-url.service';
import { FinanceWallet } from '../types/finance-wallet';

class WalletService extends BaseCompanyService {
  private path = 'finance-wallets';

  async get(): Promise<FinanceWallet> {
    const { data } = await api.get<FinanceWallet>(this.getUrlBase(this.path));
    return data;
  }

  async recalculate(): Promise<FinanceWallet> {
    const { data } = await api.post<FinanceWallet>(
      `${this.getUrlBase(this.path)}/recalculate`,
    );
    return data;
  }

  async update(
    walletId: string,
    payload: { initialValue: number },
  ): Promise<FinanceWallet> {
    const { data } = await api.put<FinanceWallet>(
      `${this.getUrlBase(this.path)}/${walletId}`,
      payload,
    );
    return data;
  }
}

export const walletService = new WalletService();
