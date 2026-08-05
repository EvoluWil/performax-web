import { Module } from "@/types/module";

export type Permission = {
  permission: "FILTER" | "READ" | "WRITE" | "ADMIN";
  scope: "SELF" | "TEAM" | "ALL";
  moduleId: string;
  module: Module;
};
