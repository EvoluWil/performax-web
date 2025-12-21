import {
  AssignUserRoleDto,
  userRoleService,
} from "@/features/user/services/user-role.service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { UserClientsFormDto, UserSubordinatesFormDto } from "../../schemas";

export const useUserRoleMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      type: "assign" | "remove";
      data?: AssignUserRoleDto;
      userId?: string;
    }) => {
      switch (params.type) {
        case "assign":
          if (!params.data) throw new Error("Data is required for assign");
          return userRoleService.assignRole(params.data);
        case "remove":
          if (!params.userId) throw new Error("User ID is required for remove");
          return userRoleService.removeRole(params.userId);
        default:
          throw new Error("Invalid mutation type");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
};

export const useUserRoleTargetMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      userId: string;
      data: UserSubordinatesFormDto;
    }) => {
      return userRoleService.assignSubordinates(params.userId, params.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
};

export const useUserRoleClientsMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      userId: string;
      data: UserClientsFormDto;
    }) => {
      return userRoleService.assignClients(params.userId, params.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
};

export const useUserRolesQuery = (userId: string, enabled: boolean) => {
  return useQuery({
    queryKey: ["user-roles", userId],
    queryFn: () => userRoleService.getUserRole(userId),
    initialData: null,
    enabled: !!enabled && !!userId,
  });
};
