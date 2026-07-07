export const MODULE_CODES = [
  'task',
  'budget',
  'occurrence',
  'financial',
  'client',
  'contract',
  'employee',
  'user',
  'role',
  'register',
  'whitelabel',
] as const;

export type ModuleCode = (typeof MODULE_CODES)[number];

export const MODULE_DEFINITIONS: Record<
  ModuleCode,
  { name: string; description: string }
> = {
  task: {
    name: 'Ordens de Serviço',
    description: 'Gestão de ordens de serviço e atendimento',
  },
  budget: {
    name: 'Orçamentos',
    description: 'Gestão de orçamentos',
  },
  occurrence: {
    name: 'Ocorrências',
    description: 'Gestão de ocorrências',
  },
  financial: {
    name: 'Financeiro',
    description: 'Lançamentos financeiros, adiantamentos e cadastros financeiros',
  },
  client: {
    name: 'Clientes',
    description: 'Gestão de clientes',
  },
  contract: {
    name: 'Contratos',
    description: 'Gestão de contratos e tipos de contrato',
  },
  employee: {
    name: 'Funcionários',
    description: 'Gestão de funcionários',
  },
  user: {
    name: 'Usuários',
    description: 'Gestão de usuários da empresa',
  },
  role: {
    name: 'Cargos',
    description: 'Gestão de cargos e permissões',
  },
  register: {
    name: 'Cadastros',
    description: 'Tipos de OS, orçamento e ocorrência',
  },
  whitelabel: {
    name: 'White Label',
    description: 'Personalização visual da empresa',
  },
};
