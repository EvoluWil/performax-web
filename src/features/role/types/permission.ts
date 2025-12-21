import { Module } from "@/types/module";

export type Permission = {
  permission: "READ" | "WRITE" | "ADMIN";
  scope: "SELF" | "TEAM" | "ALL";
  moduleId: string;
  module: Module;
};
