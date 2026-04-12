import {
  AppRegistration,
  BusinessCenter,
  ContactsOutlined,
  MonetizationOn,
  PeopleOutline,
  SecurityOutlined,
  SupportAgent,
  Work,
} from '@mui/icons-material';
import { JSX } from 'react';

type Module =
  | 'task'
  | 'budget'
  | 'occurrence'
  | 'client'
  | 'user'
  | 'role'
  | 'financial';

export type Route = {
  id: string;
  label?: string;
  icon?: JSX.Element;
  path: string;
  subRoutes?: SubRoute[];
  modules: Module[];
  permissions: Module[];
  scope?: 'read' | 'write' | 'admin';
  adminOnly?: boolean;
};

export type SubRoute = {
  id: string;
  label?: string;
  path: string;
  subRoutes?: SubRoute[];
  modules: Module[];
  permissions: Module[];
  scope?: 'read' | 'write' | 'admin';
  adminOnly?: boolean;
};

export const routes: Route[] = [
  {
    id: 'Atendimento',
    icon: <SupportAgent sx={{ color: 'white' }} />,
    path: '/panel/attendance',
    permissions: ['task'],
    modules: ['task'],
    scope: 'write',
  },
  {
    id: 'Operacional',
    icon: <Work sx={{ color: 'white' }} />,
    path: '/panel/tasks',
    permissions: ['task', 'budget', 'occurrence'],
    modules: ['task', 'budget', 'occurrence'],
    subRoutes: [
      {
        id: 'Ordens de Serviço',
        path: '/panel/tasks',
        permissions: ['task'],
        modules: ['task'],
      },
      {
        id: 'Orçamentos',
        path: '/panel/budgets',
        permissions: ['budget'],
        modules: ['budget'],
      },
      {
        id: 'Ocorrências',
        path: '/panel/occurrences',
        permissions: ['occurrence'],
        modules: ['occurrence'],
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
  {
    id: 'Financeiro',
    icon: <MonetizationOn sx={{ color: 'white' }} />,
    path: '/panel/financial',
    permissions: ['financial'],
    modules: ['financial'],
    subRoutes: [
      {
        id: 'Lançamentos',
        path: '/panel/financial',
        permissions: ['financial'],
        modules: ['financial'],
      },
      {
        id: 'Balanço',
        path: '/panel/financial/balance',
        permissions: ['financial'],
        modules: ['financial'],
      },
      {
        id: 'financial-cadastros',
        label: 'Cadastros',
        path: '/panel/financial/types',
        permissions: ['financial'],
        modules: ['financial'],
        scope: 'write',
        subRoutes: [
          {
            id: 'Centros de Custo',
            path: '/panel/financial/types',
            permissions: ['financial'],
            modules: ['financial'],
            scope: 'write',
          },
          {
            id: 'Bancos',
            path: '/panel/financial/banks',
            permissions: ['financial'],
            modules: ['financial'],
            scope: 'write',
          },
          {
            id: 'Categorias',
            path: '/panel/financial/categories',
            permissions: ['financial'],
            modules: ['financial'],
            scope: 'write',
          },
          {
            id: 'Segmentos',
            path: '/panel/financial/segments',
            permissions: ['financial'],
            modules: ['financial'],
            scope: 'write',
          },
          {
            id: 'Favorecidos',
            path: '/panel/financial/payees',
            permissions: ['financial'],
            modules: ['financial'],
            scope: 'write',
          },
          {
            id: 'Métodos de Pgto',
            path: '/panel/financial/payment-methods',
            permissions: ['financial'],
            modules: ['financial'],
            scope: 'write',
          },
          {
            id: 'Recorrências',
            path: '/panel/financial/recurring',
            permissions: ['financial'],
            modules: ['financial'],
            scope: 'admin',
          },
        ],
      },
    ],
  },
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
  {
    id: 'Cadastros',
    icon: <AppRegistration sx={{ color: 'white' }} />,
    path: '/panel/register',
    permissions: ['task', 'budget', 'occurrence'],
    modules: ['task', 'budget', 'occurrence'],
    scope: 'write',
    subRoutes: [
      {
        id: 'Tipos de OS',
        path: '/panel/tasks/types',
        permissions: ['task'],
        scope: 'write',
        modules: ['task'],
      },
      {
        id: 'Tipos de orçamento',
        path: '/panel/budgets/types',
        permissions: ['budget'],
        modules: ['budget'],
        scope: 'write',
      },
      {
        id: 'Tipos de ocorrência',
        path: '/panel/occurrences/types',
        permissions: ['occurrence'],
        modules: ['occurrence'],
        scope: 'write',
      },
    ],
  },
  {
    id: 'Clientes',
    icon: <ContactsOutlined sx={{ color: 'white' }} />,
    path: '/panel/clients',
    permissions: ['client'],
    modules: ['client'],
    scope: 'read',
  },
  {
    id: 'Usuários',
    icon: <PeopleOutline sx={{ color: 'white' }} />,
    path: '/panel/users',
    permissions: ['user'],
    modules: ['user'],
    scope: 'read',
  },
  {
    id: 'Cargos',
    icon: <SecurityOutlined sx={{ color: 'white' }} />,
    path: '/panel/roles',
    permissions: ['role'],
    modules: ['role'],
    scope: 'read',
  },
  {
    id: 'Minha Empresa',
    icon: <BusinessCenter sx={{ color: 'white' }} />,
    path: '/panel/customization',
    permissions: [],
    modules: [],
    adminOnly: true,
  },
];
