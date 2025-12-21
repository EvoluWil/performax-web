import { authService } from "@/features/auth/services";
import { useQuery } from "@tanstack/react-query";

export function useMeQuery() {
  return useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const modules = await authService.getMe();
      return modules;
    },
    initialData: null,
    refetchOnWindowFocus: false,
  });
}
