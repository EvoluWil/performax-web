import { fetchViaCep } from '@/utils/viacep';
import { useQuery } from '@tanstack/react-query';

export function useViaCepQuery(postalCode: string) {
  const cep = postalCode.replace(/\D/g, '');

  return useQuery({
    queryKey: ['viaCep', cep],
    queryFn: () => fetchViaCep(cep),
    enabled: cep.length === 8,
    refetchOnWindowFocus: false,
    staleTime: Infinity,
  });
}
