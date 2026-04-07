import { Changelog } from '../types';

export const CHANGELOGS: Changelog[] = [
  {
    id: '10',
    version: '1.10.0',
    title: 'Recorrências financeiras aprimoradas',
    description:
      'Lançamentos recorrentes agora são totalmente editáveis (fluxo, valor, datas, banco, método, categoria, etc.).\n' +
      'O resumo da recorrência é exibido no drawer de edição e na tela de detalhe do lançamento.\n' +
      'O campo de recorrência só aparece ao criar ou quando o lançamento já possui recorrência configurada.\n' +
      'Corrigido: valor em centavos exibido e salvo corretamente (R$20,00 = 2000 centavos).\n' +
      'Corrigido: data de vencimento pré-carregada corretamente ao editar.',
    type: 'IMPROVEMENT',
    date: '2026-04-07',
    deleted: false,
    createdAt: '2026-04-07',
    updatedAt: '2026-04-07',
  },
  {
    id: '9',
    version: '1.9.0',
    title: 'Personalização de colunas em Ocorrências',
    description:
      'A tela de listagem de ocorrências agora oferece personalização de colunas, mantendo o padrão já existente nos lançamentos financeiros.',
    type: 'FEATURE',
    date: '2026-04-07',
    deleted: false,
    createdAt: '2026-04-07',
    updatedAt: '2026-04-07',
  },
  {
    id: '8',
    version: '1.8.0',
    title: 'Saldo inicial da carteira financeira',
    description:
      'Carteiras financeiras agora possuem o campo "Saldo inicial".\n' +
      'O recálculo da carteira considera o saldo inicial como base para o total apurado.',
    type: 'FEATURE',
    date: '2026-04-01',
    deleted: false,
    createdAt: '2026-04-01',
    updatedAt: '2026-04-01',
  },
  {
    id: '7',
    version: '1.7.0',
    title: 'Segmentos financeiros',
    description:
      'Novo cadastro de segmentos financeiros disponível em Cadastros > Segmentos.\n' +
      'Lançamentos podem ser filtrados por segmento na listagem.',
    type: 'FEATURE',
    date: '2026-03-25',
    deleted: false,
    createdAt: '2026-03-25',
    updatedAt: '2026-03-25',
  },
  {
    id: '6',
    version: '1.6.0',
    title: 'Menu Cadastros no módulo financeiro',
    description:
      'O módulo financeiro ganhou um submenu "Cadastros" reunindo bancos, métodos, tipos (centro de custo), categorias, segmentos e favorecidos em um só lugar.',
    type: 'IMPROVEMENT',
    date: '2026-03-20',
    deleted: false,
    createdAt: '2026-03-20',
    updatedAt: '2026-03-20',
  },
  {
    id: '5',
    version: '1.5.0',
    title: 'Transferências entre empresas do grupo',
    description:
      'Empresas do mesmo grupo agora podem realizar transferências financeiras entre si.\n' +
      'Ao marcar a entrada ou saída como paga, a contraparte é automaticamente liquidada.',
    type: 'FEATURE',
    date: '2026-03-15',
    deleted: false,
    createdAt: '2026-03-15',
    updatedAt: '2026-03-15',
  },
  {
    id: '4',
    version: '1.4.0',
    title: 'Aprovação de lançamentos por centro de custo',
    description:
      'Centros de custo podem ser marcados como "requer aprovação".\n' +
      'Lançamentos vinculados a esses centros ficam pendentes de aprovação antes de serem processados.',
    type: 'FEATURE',
    date: '2026-03-10',
    deleted: false,
    createdAt: '2026-03-10',
    updatedAt: '2026-03-10',
  },
  {
    id: '3',
    version: '1.3.0',
    title: 'Geração de PDF para relatórios',
    description:
      'Relatórios de lançamentos financeiros e ocorrências podem ser exportados em PDF diretamente pela listagem.',
    type: 'FEATURE',
    date: '2026-03-05',
    deleted: false,
    createdAt: '2026-03-05',
    updatedAt: '2026-03-05',
  },
  {
    id: '2',
    version: '1.2.0',
    title: 'Modo de visualização em cards',
    description:
      'As listagens de ocorrências e lançamentos financeiros agora oferecem alternância entre visualização em tabela e em cards.',
    type: 'IMPROVEMENT',
    date: '2026-02-20',
    deleted: false,
    createdAt: '2026-02-20',
    updatedAt: '2026-02-20',
  },
  {
    id: '1',
    version: '1.1.0',
    title: 'Lançamento inicial da plataforma Performax',
    description:
      'Módulos disponíveis: Financeiro (lançamentos, carteira, recorrências), Ocorrências, Funcionários, Clientes, Relatórios e Ranking.\n' +
      'Autenticação com controle de permissões por módulo.',
    type: 'FEATURE',
    date: '2026-02-01',
    deleted: false,
    createdAt: '2026-02-01',
    updatedAt: '2026-02-01',
  },
];
