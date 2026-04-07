import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { walletService } from '../../services/wallet.service';
import type { FinanceWallet } from '../../types/finance-wallet';

export function useWalletQuery() {
  return useQuery({
    queryKey: ['financeWallet'],
    queryFn: () => walletService.get(),
    refetchOnWindowFocus: false,
  });
}

export const useWalletRecalculateMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<FinanceWallet, Error, void>({
    mutationFn: () => walletService.recalculate(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financeWallet'] });
    },
  });
};

export const useWalletUpdateMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<
    FinanceWallet,
    Error,
    { walletId: string; initialValue: number }
  >({
    mutationFn: ({ walletId, initialValue }) =>
      walletService.update(walletId, { initialValue }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financeWallet'] });
    },
  });
};
