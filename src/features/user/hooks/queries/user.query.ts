import { UserFormDto } from "@/features/user/schemas";
import { getUserQuery, userService } from "@/features/user/services";
import { useCompanyPermissions } from "@/hooks/common/permission";
import { User } from "@/types/user";
import { applyScopedFilter } from "@/utils/query";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";

type UserMutationInput = {
  type: "create" | "update" | "delete";
  id?: string;
  data?: UserFormDto;
};

type UsersQueryOptions = {
  scopeModule?: string;
};

export function useUsersQuery(options: UsersQueryOptions = {}) {
  const scopeModule = options.scopeModule ?? "user";
  const { getScopedUserIds } = useCompanyPermissions();

  const scopedUserIds = useMemo(
    () => getScopedUserIds(scopeModule),
    [getScopedUserIds, scopeModule]
  );

  const scopedQuery = useMemo(() => {
    const baseQuery = {
      ...getUserQuery,
      filter: getUserQuery.filter ? [...getUserQuery.filter] : [],
    };

    return applyScopedFilter(baseQuery, scopedUserIds, {
      field: "id",
      operator: "in",
    });
  }, [scopedUserIds]);

  const enabled = scopedQuery !== null;

  return useQuery({
    queryKey: ["users", scopeModule, scopedQuery ?? "no-access"],
    queryFn: async () => {
      if (!scopedQuery) {
        return { data: [], count: 0 };
      }
      return userService.get(scopedQuery);
    },
    enabled,
    initialData: { data: [], count: 0 },
    refetchOnWindowFocus: false,
  });
}

export const useUserMutation = () => {
  const queryUser = useQueryClient();

  const mutationFn = async (input: UserMutationInput): Promise<User> => {
    switch (input.type) {
      case "create":
        return userService.create(input?.data as UserFormDto);
      case "update":
        return userService.update(
          input?.id as string,
          input?.data as UserFormDto
        );
      case "delete":
        return userService.delete(input?.id as string);
    }
  };

  return useMutation<User, Error, UserMutationInput>({
    mutationFn,
    onSuccess: () => {
      queryUser.invalidateQueries({ queryKey: ["users"] });
    },
  });
};
