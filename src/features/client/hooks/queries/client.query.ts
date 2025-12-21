import { ClientFormDto } from "@/features/client/schemas";
import { clientService } from "@/features/client/services";
import { getClientQuery } from "@/features/client/services/client.service";
import { Client } from "@/features/client/types";
import { useCompanyPermissions } from "@/hooks/common/permission";
import { applyScopedFilter } from "@/utils/query";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";

type ClientMutationInput = {
  type: "create" | "update" | "delete";
  id?: string;
  data?: ClientFormDto;
};

type ClientsQueryOptions = {
  scopeModule?: string;
};

export function useClientsQuery(options: ClientsQueryOptions = {}) {
  const scopeModule = options.scopeModule ?? "client";
  const { getScopedUserIds } = useCompanyPermissions();

  const scopedUserIds = useMemo(
    () => getScopedUserIds(scopeModule),
    [getScopedUserIds, scopeModule]
  );

  const scopedQuery = useMemo(() => {
    const baseQuery = {
      ...getClientQuery,
      filter: getClientQuery.filter ? [...getClientQuery.filter] : [],
    };

    return applyScopedFilter(baseQuery, scopedUserIds, {
      field: "userIds",
      operator: "hasSome",
    });
  }, [scopedUserIds]);

  const enabled = scopedQuery !== null;

  return useQuery({
    queryKey: ["clients", scopeModule, scopedQuery ?? "no-access"],
    queryFn: async () => {
      if (!scopedQuery) {
        return { data: [], count: 0 };
      }
      return clientService.get(scopedQuery);
    },
    enabled,
    initialData: { data: [], count: 0 },
    refetchOnWindowFocus: false,
  });
}

export const useClientMutation = () => {
  const queryClient = useQueryClient();

  const mutationFn = async (input: ClientMutationInput): Promise<Client> => {
    switch (input.type) {
      case "create":
        return clientService.create(input?.data as ClientFormDto);
      case "update":
        return clientService.update(
          input?.id as string,
          input?.data as ClientFormDto
        );
      case "delete":
        return clientService.delete(input?.id as string);
    }
  };

  return useMutation<Client, Error, ClientMutationInput>({
    mutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
  });
};
