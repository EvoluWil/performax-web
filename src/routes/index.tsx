import {
  ContactsOutlined,
  PeopleOutline,
  SecurityOutlined,
  Work,
} from "@mui/icons-material";
import { JSX } from "react";

type Module = "task" | "budget" | "client" | "user" | "role";

export type Route = {
  id: string;
  icon?: JSX.Element;
  path: string;
  subRoutes?: SubRoute[];
  modules: Module[];
  permissions: Module[];
  scope?: "read" | "write" | "admin";
};

export type SubRoute = {
  id: string;
  path: string;
  subRoutes?: SubRoute[];
  modules: Module[];
  permissions: Module[];
  scope?: "read" | "write" | "admin";
};

export const routes: Route[] = [
  {
    id: "Operacional",
    icon: <Work sx={{ color: "white" }} />,
    path: "/panel/tasks",
    permissions: ["task", "budget"],
    modules: ["task", "budget"],
    subRoutes: [
      {
        id: "Tarefas",
        path: "/panel/tasks",
        permissions: ["task"],
        modules: ["task"],
        subRoutes: [
          {
            id: "Lista de tarefas",
            path: "/panel/tasks",
            permissions: ["task"],
            modules: ["task"],
          },
          {
            id: "Tipos de tarefa",
            path: "/panel/tasks/types",
            permissions: ["task"],
            scope: "write",
            modules: ["task"],
          },
        ],
      },
      {
        id: "Orçamentos",
        path: "/panel/budgets",
        permissions: ["budget"],
        modules: ["budget"],
        subRoutes: [
          {
            id: "Lista de orçamentos",
            path: "/panel/budgets",
            permissions: ["budget"],
            modules: ["budget"],
          },
          {
            id: "Tipos de orçamento",
            path: "/panel/budgets/types",
            permissions: ["budget"],
            modules: ["budget"],
            scope: "write",
          },
        ],
      },
      // {
      //   id: 'Lançamentos',
      //   path: '/panel/entries',
      //   role: ['USER', 'ADMIN', 'COORDINATOR', 'ATTENDANT', 'FINANCIAL'],
      // },
      // {
      //   id: 'Orçamentos',
      //   path: '/panel/budgets',
      //   role: [
      //     'USER',
      //     'ADMIN',
      //     'COORDINATOR',
      //     'ATTENDANT',
      //     'FINANCIAL',
      //     'GESTOR',
      //   ],
      // },
      // {
      //   id: 'Ocorrências',
      //   path: '/panel/occurrences',
      //   role: ['USER', 'ADMIN', 'COORDINATOR', 'ATTENDANT', 'FINANCIAL'],
      // },
    ],
  },
  // {
  //   id: 'Financeiro',
  //   icon: <MonetizationOn sx={{ color: 'white' }} />,
  //   path: '/panel/financial',
  //   role: ['ADMIN', 'FINANCIAL'],
  // },
  // {
  //   id: 'Relatórios',
  //   icon: <Assessment sx={{ color: 'white' }} />,
  //   path: '/panel/reports/tasks',
  //   role: ['COORDINATOR', 'GESTOR', 'ADMIN', 'ATTENDANT', 'FINANCIAL'],
  //   subRoutes: [
  //     {
  //       id: 'Relatório de tarefas',
  //       path: '/panel/reports/tasks',
  //       role: ['COORDINATOR', 'GESTOR', 'ADMIN', 'ATTENDANT'],
  //     },
  //     {
  //       id: 'Relatório de lançamentos',
  //       path: '/panel/reports/entries',
  //       role: ['COORDINATOR', 'GESTOR', 'ADMIN'],
  //     },
  //     {
  //       id: 'Relatório financeiro',
  //       path: '/panel/reports/financial',
  //       role: ['ADMIN', 'FINANCIAL'],
  //     },
  //     {
  //       id: 'Relatório de orçamentos',
  //       path: '/panel/reports/budgets',
  //       role: ['COORDINATOR', 'GESTOR', 'ADMIN', 'FINANCIAL'],
  //     },
  //     {
  //       id: 'Relatório de ocorrências',
  //       path: '/panel/reports/occurrences',
  //       role: ['COORDINATOR', 'GESTOR', 'ADMIN'],
  //     },
  //   ],
  // },
  // {
  //   id: 'Cadastros',
  //   icon: <AppRegistration sx={{ color: 'white' }} />,
  //   path: '/panel/register/users',
  //   role: ['USER', 'ADMIN', 'COORDINATOR', 'ATTENDANT', 'FINANCIAL'],
  //   subRoutes: [
  //     {
  //       id: 'Usuários',
  //       path: '/panel/register/users',
  //       role: ['COORDINATOR', 'ADMIN'],
  //     },
  //     {
  //       id: 'Clientes',
  //       path: '/panel/register/clients',
  //       role: ['USER', 'ADMIN', 'COORDINATOR', 'ATTENDANT', 'FINANCIAL'],
  //     },
  //     {
  //       id: 'Empresas',
  //       path: '/panel/register/companies',
  //       role: ['COORDINATOR', 'ADMIN', 'FINANCIAL'],
  //     },
  //     {
  //       id: 'Gestores',
  //       path: '/panel/register/gestor',
  //       role: ['COORDINATOR', 'ADMIN'],
  //     },
  //     {
  //       id: 'Funcionários',
  //       path: '/panel/register/employees',
  //       role: ['COORDINATOR', 'ADMIN'],
  //     },
  //     {
  //       id: 'Bancos',
  //       path: '/panel/register/banks',
  //       role: ['ADMIN', 'FINANCIAL'],
  //     },
  //     {
  //       id: 'Métodos de pagamento',
  //       path: '/panel/register/payment-methods',
  //       role: ['ADMIN', 'FINANCIAL'],
  //     },
  //     {
  //       id: 'Favorecidos',
  //       path: '/panel/register/financial-favored',
  //       role: ['ADMIN', 'FINANCIAL'],
  //     },
  //     {
  //       id: 'Categorias de lançamentos financeiros',
  //       path: '/panel/register/financial-categories',
  //       role: ['ADMIN', 'FINANCIAL'],
  //     },
  //     {
  //       id: 'Tipos de lançamento financeiro',
  //       path: '/panel/register/financial-types',
  //       role: ['ADMIN', 'FINANCIAL'],
  //     },
  //     {
  //       id: 'Tipos de lançamento',
  //       path: '/panel/register/entry-types',
  //       role: ['COORDINATOR', 'ADMIN'],
  //     },
  //     {
  //       id: 'Tipos de ocorrência',
  //       path: '/panel/register/occurrence-types',
  //       role: ['USER', 'ADMIN', 'COORDINATOR', 'ATTENDANT', 'FINANCIAL'],
  //     },
  //     {
  //       id: 'Tipos de orçamento',
  //       path: '/panel/register/budget-types',
  //       role: ['COORDINATOR', 'ADMIN', 'FINANCIAL'],
  //     },
  //     {
  //       id: 'Tipos de tarefa',
  //       path: '/panel/register/task-types',
  //       role: ['COORDINATOR', 'ADMIN'],
  //     },
  //   ],
  // },
  {
    id: "Clientes",
    icon: <ContactsOutlined sx={{ color: "white" }} />,
    path: "/panel/clients",
    permissions: ["client"],
    modules: ["client"],
    scope: "read",
  },
  {
    id: "Usuários",
    icon: <PeopleOutline sx={{ color: "white" }} />,
    path: "/panel/users",
    permissions: ["user"],
    modules: ["user"],
    scope: "read",
  },
  {
    id: "Cargos",
    icon: <SecurityOutlined sx={{ color: "white" }} />,
    path: "/panel/roles",
    permissions: ["role"],
    modules: ["role"],
    scope: "read",
  },
];
