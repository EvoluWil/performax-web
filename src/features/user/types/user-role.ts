import { Client } from "@/features/client/types";
import { User } from "@/types/user";

export type UserRole = {
  id: string;
  userId: string;
  companyId: string;
  roleId?: string;
  targetIds: string[];
  targets: User[];
  clientIds: string[];
  clients: Client[];
};
