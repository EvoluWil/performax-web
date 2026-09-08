import { fetchCnpj } from '@/utils/cnpj-lookup';
import { useQuery } from '@tanstack/react-query';

export function useCnpjQuery(cnpj: string) {
  const digits = cnpj.replace(/\D/g, '');

  return useQuery({
    queryKey: ['cnpj', digits],
    queryFn: () => fetchCnpj(digits),
    enabled: digits.length === 14,
    refetchOnWindowFocus: false,
    staleTime: Infinity,
  });
}
