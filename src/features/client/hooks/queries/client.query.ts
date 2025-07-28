import { ClientFormDto } from '@/features/client/schemas';
import { clientService } from '@/features/client/services';
import { Client } from '@/features/client/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

type ClientMutationInput = {
  type: 'create' | 'update' | 'delete';
  id?: string;
  data?: ClientFormDto;
};

export function useClientsQuery() {
  return useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const clients = await clientService.get();
      return clients;
    },
    initialData: { data: [], count: 0 },
    refetchOnWindowFocus: false,
  });
}

export const useClientMutation = () => {
  const queryClient = useQueryClient();

  const mutationFn = async (input: ClientMutationInput): Promise<Client> => {
    switch (input.type) {
      case 'create':
        return clientService.create(input?.data as ClientFormDto);
      case 'update':
        return clientService.update(
          input?.id as string,
          input?.data as ClientFormDto,
        );
      case 'delete':
        return clientService.delete(input?.id as string);
    }
  };

  return useMutation<Client, Error, ClientMutationInput>({
    mutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });
};
