import type { CsvImportConfig } from '@/components/csv-import';
import {
  parseCsvDate,
  parseCsvFlow,
  parseCsvMoney,
  parseItemType,
  parseOptionalCsvDate,
} from '@/components/csv-import/csv-import-parsers';
import { budgetToCents } from '@/features/budget/util/currency';
import type { BudgetFormDto } from '@/features/budget/schemas/budget-drawer.schema';
import { contractFormToPayload } from '@/features/contract/schemas/contract.schema';
import type { ContractFormDto } from '@/features/contract/schemas/contract.schema';
import type { FinanceFormDto } from '@/features/financial/schemas/finance-drawer.schema';
import type { FinanceRecurringFormDto } from '@/features/financial/schemas/finance-recurring-drawer.schema';
import type { OccurrenceFormDto } from '@/features/occurrence/schemas/occurrence-drawer.schema';
import type { TaskFormDto } from '@/features/task/schemas/task-drawer.schema';
import { TaskStatusEnum } from '@/features/task/types/task';
import * as yup from 'yup';
import { createFinanceCsvImportConfig } from '@/features/financial/config/finance-csv-import.config';

export { createFinanceCsvImportConfig };

// ─── Tasks ───────────────────────────────────────────────────────────────────

export type TaskImportRow = {
  title: string;
  descricao: string;
  data: string;
  valor?: string;
  cliente: string;
  tipo: string;
  responsavel: string;
  observacaoInterna?: string;
};

const taskImportSchema = yup.object().shape({
  title: yup.string().required('Título é obrigatório'),
  descricao: yup.string().required('Descrição é obrigatória'),
  data: yup.string().required('Data é obrigatória'),
  valor: yup.string().optional(),
  cliente: yup.string().required('Cliente é obrigatório'),
  tipo: yup.string().required('Tipo é obrigatório'),
  responsavel: yup.string().required('Responsável é obrigatório'),
  observacaoInterna: yup.string().optional(),
}) as yup.ObjectSchema<TaskImportRow>;

export function createTaskCsvImportConfig(
  onCreate: (row: TaskFormDto) => Promise<unknown>,
): CsvImportConfig<TaskImportRow, TaskFormDto> {
  return {
    entityLabel: 'ordens de serviço',
    columns: [
      { key: 'title', header: 'Título', required: true, example: 'Manutenção preventiva' },
      { key: 'descricao', header: 'Descrição', required: true, example: 'Detalhes da OS' },
      { key: 'data', header: 'Data', required: true, example: '15/03/2026 14:00' },
      { key: 'valor', header: 'Valor', example: '500,00' },
      { key: 'cliente', header: 'Cliente', required: true, example: 'Empresa Exemplo Ltda' },
      { key: 'tipo', header: 'Tipo', required: true, example: 'Manutenção' },
      { key: 'responsavel', header: 'Responsável', required: true, example: 'João Silva' },
      { key: 'observacaoInterna', header: 'Obs. Interna' },
    ],
    schema: taskImportSchema,
    references: [
      { csvKey: 'cliente', targetKey: 'clientId', resourceKey: 'clients', label: 'Cliente', required: true },
      { csvKey: 'tipo', targetKey: 'typeId', resourceKey: 'taskTypes', label: 'Tipo', required: true },
      { csvKey: 'responsavel', targetKey: 'responsibleId', resourceKey: 'users', label: 'Responsável', required: true },
    ],
    mapRow: (row, resolvedIds) => ({
      title: row.title,
      description: row.descricao,
      date: parseCsvDate(row.data),
      value: row.valor ? parseCsvMoney(row.valor) : 0,
      clientId: resolvedIds.clientId as string,
      typeId: resolvedIds.typeId as string,
      responsibleId: resolvedIds.responsibleId as string,
      status: TaskStatusEnum.OPEN,
      internalNote: row.observacaoInterna,
    }),
    onCreate,
  };
}

// ─── Budgets ─────────────────────────────────────────────────────────────────

export type BudgetImportRow = {
  title: string;
  descricao?: string;
  observacao?: string;
  cliente: string;
  tipo: string;
  responsavel: string;
  itemDescricao: string;
  itemTipo?: string;
  itemQuantidade?: string;
  itemValor: string;
};

const budgetImportSchema = yup.object().shape({
  title: yup.string().required('Título é obrigatório'),
  descricao: yup.string().optional(),
  observacao: yup.string().optional(),
  cliente: yup.string().required('Cliente é obrigatório'),
  tipo: yup.string().required('Tipo é obrigatório'),
  responsavel: yup.string().required('Responsável é obrigatório'),
  itemDescricao: yup.string().required('Descrição do item é obrigatória'),
  itemTipo: yup.string().optional(),
  itemQuantidade: yup.string().optional(),
  itemValor: yup.string().required('Valor do item é obrigatório'),
}) as yup.ObjectSchema<BudgetImportRow>;

export function createBudgetCsvImportConfig(
  onCreate: (row: BudgetFormDto) => Promise<unknown>,
): CsvImportConfig<BudgetImportRow, BudgetFormDto> {
  return {
    entityLabel: 'orçamentos',
    columns: [
      { key: 'title', header: 'Título', required: true, example: 'Orçamento reforma' },
      { key: 'cliente', header: 'Cliente', required: true, example: 'Empresa Exemplo Ltda' },
      { key: 'tipo', header: 'Tipo', required: true, example: 'Orçamento padrão' },
      { key: 'responsavel', header: 'Responsável', required: true, example: 'Maria Souza' },
      { key: 'itemDescricao', header: 'Item Descrição', required: true, example: 'Serviço de instalação' },
      { key: 'itemTipo', header: 'Item Tipo', example: 'Serviço' },
      { key: 'itemQuantidade', header: 'Item Qtd', example: '1' },
      { key: 'itemValor', header: 'Item Valor', required: true, example: '1500,00' },
      { key: 'descricao', header: 'Descrição' },
      { key: 'observacao', header: 'Observação' },
    ],
    schema: budgetImportSchema,
    references: [
      { csvKey: 'cliente', targetKey: 'clientId', resourceKey: 'clients', label: 'Cliente', required: true },
      { csvKey: 'tipo', targetKey: 'typeId', resourceKey: 'budgetTypes', label: 'Tipo', required: true },
      { csvKey: 'responsavel', targetKey: 'responsibleId', resourceKey: 'users', label: 'Responsável', required: true },
    ],
    mapRow: (row, resolvedIds) => {
      const quantity = Number(row.itemQuantidade || 1) || 1;
      const itemValue = budgetToCents(parseCsvMoney(row.itemValor));
      const items = [
        {
          label: row.itemDescricao,
          type: parseItemType(row.itemTipo),
          quantity,
          value: itemValue,
        },
      ];
      const total = items.reduce(
        (acc, item) => acc + item.value * (item.quantity || 1),
        0,
      );
      return {
        title: row.title,
        description: row.descricao,
        observation: row.observacao,
        clientId: resolvedIds.clientId,
        typeId: resolvedIds.typeId as string,
        responsibleId: resolvedIds.responsibleId as string,
        items,
        value: total,
      };
    },
    onCreate,
  };
}

// ─── Occurrences ─────────────────────────────────────────────────────────────

export type OccurrenceImportRow = {
  title: string;
  descricao?: string;
  observacao?: string;
  data: string;
  cliente: string;
  tipo: string;
  responsavel: string;
};

const occurrenceImportSchema = yup.object().shape({
  title: yup.string().required('Título é obrigatório'),
  descricao: yup.string().optional(),
  observacao: yup.string().optional(),
  data: yup.string().required('Data é obrigatória'),
  cliente: yup.string().required('Cliente é obrigatório'),
  tipo: yup.string().required('Tipo é obrigatório'),
  responsavel: yup.string().required('Responsável é obrigatório'),
}) as yup.ObjectSchema<OccurrenceImportRow>;

export function createOccurrenceCsvImportConfig(
  onCreate: (row: OccurrenceFormDto) => Promise<unknown>,
): CsvImportConfig<OccurrenceImportRow, OccurrenceFormDto> {
  return {
    entityLabel: 'ocorrências',
    columns: [
      { key: 'title', header: 'Título', required: true, example: 'Incidente na loja' },
      { key: 'data', header: 'Data', required: true, example: '15/03/2026' },
      { key: 'cliente', header: 'Cliente', required: true, example: 'Empresa Exemplo Ltda' },
      { key: 'tipo', header: 'Tipo', required: true, example: 'Incidente' },
      { key: 'responsavel', header: 'Responsável', required: true, example: 'João Silva' },
      { key: 'descricao', header: 'Descrição' },
      { key: 'observacao', header: 'Observação' },
    ],
    schema: occurrenceImportSchema,
    references: [
      { csvKey: 'cliente', targetKey: 'clientId', resourceKey: 'clients', label: 'Cliente', required: true },
      { csvKey: 'tipo', targetKey: 'typeId', resourceKey: 'occurrenceTypes', label: 'Tipo', required: true },
      { csvKey: 'responsavel', targetKey: 'responsibleId', resourceKey: 'users', label: 'Responsável', required: true },
    ],
    mapRow: (row, resolvedIds) => ({
      title: row.title,
      description: row.descricao ?? '',
      observation: row.observacao ?? '',
      date: parseCsvDate(row.data),
      clientId: resolvedIds.clientId,
      typeId: resolvedIds.typeId as string,
      responsibleId: resolvedIds.responsibleId as string,
    }),
    onCreate,
  };
}

// ─── Contracts ───────────────────────────────────────────────────────────────

export type ContractImportRow = {
  cliente: string;
  tipoContrato: string;
  valor: string;
  inicio?: string;
  termino?: string;
  vencimento?: string;
  escopo?: string;
};

const contractImportSchema = yup.object().shape({
  cliente: yup.string().required('Cliente é obrigatório'),
  tipoContrato: yup.string().required('Tipo de contrato é obrigatório'),
  valor: yup.string().required('Valor é obrigatório'),
  inicio: yup.string().optional(),
  termino: yup.string().optional(),
  vencimento: yup.string().optional(),
  escopo: yup.string().optional(),
}) as yup.ObjectSchema<ContractImportRow>;

export function createContractCsvImportConfig(
  onCreate: (row: ReturnType<typeof contractFormToPayload>) => Promise<unknown>,
): CsvImportConfig<ContractImportRow, ReturnType<typeof contractFormToPayload>> {
  return {
    entityLabel: 'contratos',
    columns: [
      { key: 'cliente', header: 'Cliente', required: true, example: 'Empresa Exemplo Ltda' },
      { key: 'tipoContrato', header: 'Tipo de Contrato', required: true, example: 'Contrato mensal' },
      { key: 'valor', header: 'Valor', required: true, example: '5000,00' },
      { key: 'inicio', header: 'Início', example: '01/01/2026' },
      { key: 'termino', header: 'Término', example: '31/12/2026' },
      { key: 'vencimento', header: 'Vencimento', example: '10/01/2026' },
      { key: 'escopo', header: 'Escopo', example: 'Prestação de serviços mensais' },
    ],
    schema: contractImportSchema,
    references: [
      { csvKey: 'cliente', targetKey: 'clientId', resourceKey: 'clients', label: 'Cliente', required: true },
      { csvKey: 'tipoContrato', targetKey: 'typeId', resourceKey: 'contractTypes', label: 'Tipo de Contrato', required: true },
    ],
    mapRow: (row, resolvedIds) =>
      contractFormToPayload({
        clientId: resolvedIds.clientId as string,
        typeId: resolvedIds.typeId as string,
        value: parseCsvMoney(row.valor),
        startDate: parseOptionalCsvDate(row.inicio),
        endDate: parseOptionalCsvDate(row.termino),
        dueDate: parseOptionalCsvDate(row.vencimento),
        scope: row.escopo,
      } as ContractFormDto),
    onCreate,
  };
}

// ─── Advances ────────────────────────────────────────────────────────────────

export type AdvanceImportRow = {
  title: string;
  valor: string;
  data: string;
  banco: string;
  metodo: string;
  centroCusto?: string;
  descricao?: string;
  observacao?: string;
};

const advanceImportSchema = yup.object().shape({
  title: yup.string().required('Título é obrigatório'),
  valor: yup.string().required('Valor é obrigatório'),
  data: yup.string().required('Data é obrigatória'),
  banco: yup.string().required('Banco é obrigatório'),
  metodo: yup.string().required('Método é obrigatório'),
  centroCusto: yup.string().optional(),
  descricao: yup.string().optional(),
  observacao: yup.string().optional(),
}) as yup.ObjectSchema<AdvanceImportRow>;

export type AdvanceCreatePayload = {
  title: string;
  description?: string;
  observation?: string;
  totalValue: number;
  date: string;
  bankId: string;
  methodId: string;
  typeId?: string;
};

export function createAdvanceCsvImportConfig(
  onCreate: (row: AdvanceCreatePayload) => Promise<unknown>,
): CsvImportConfig<AdvanceImportRow, AdvanceCreatePayload> {
  return {
    entityLabel: 'adiantamentos',
    columns: [
      { key: 'title', header: 'Título', required: true, example: 'Adiantamento viagem' },
      { key: 'valor', header: 'Valor', required: true, example: '1000,00' },
      { key: 'data', header: 'Data', required: true, example: '15/03/2026' },
      { key: 'banco', header: 'Banco', required: true, example: 'Banco Exemplo' },
      { key: 'metodo', header: 'Método', required: true, example: 'PIX' },
      { key: 'centroCusto', header: 'Centro de Custo', example: 'Operacional' },
      { key: 'descricao', header: 'Descrição' },
      { key: 'observacao', header: 'Observação' },
    ],
    schema: advanceImportSchema,
    references: [
      { csvKey: 'banco', targetKey: 'bankId', resourceKey: 'financeBanks', label: 'Banco', required: true },
      { csvKey: 'metodo', targetKey: 'methodId', resourceKey: 'financePaymentMethods', label: 'Método', required: true },
      { csvKey: 'centroCusto', targetKey: 'typeId', resourceKey: 'financeTypes', label: 'Centro de Custo' },
    ],
    mapRow: (row, resolvedIds) => ({
      title: row.title,
      description: row.descricao,
      observation: row.observacao,
      totalValue: Math.round(parseCsvMoney(row.valor) * 100),
      date: parseCsvDate(row.data),
      bankId: resolvedIds.bankId as string,
      methodId: resolvedIds.methodId as string,
      typeId: resolvedIds.typeId,
    }),
    onCreate,
  };
}

// ─── Recurring ───────────────────────────────────────────────────────────────

export type RecurringImportRow = {
  title: string;
  valor: string;
  data: string;
  fluxo: string;
  recorrencia: string;
  centroCusto?: string;
  banco?: string;
  metodo?: string;
  categoria?: string;
  cliente?: string;
  favorecido?: string;
  descricao?: string;
};

const recurringImportSchema = yup.object().shape({
  title: yup.string().required('Título é obrigatório'),
  valor: yup.string().required('Valor é obrigatório'),
  data: yup.string().required('Data é obrigatória'),
  fluxo: yup.string().required('Fluxo é obrigatório'),
  recorrencia: yup.string().required('Recorrência é obrigatória'),
  centroCusto: yup.string().optional(),
  banco: yup.string().optional(),
  metodo: yup.string().optional(),
  categoria: yup.string().optional(),
  cliente: yup.string().optional(),
  favorecido: yup.string().optional(),
  descricao: yup.string().optional(),
}) as yup.ObjectSchema<RecurringImportRow>;

export function createRecurringCsvImportConfig(
  onCreate: (row: FinanceRecurringFormDto & { value: number }) => Promise<unknown>,
): CsvImportConfig<RecurringImportRow, FinanceRecurringFormDto & { value: number }> {
  return {
    entityLabel: 'lançamentos recorrentes',
    columns: [
      { key: 'title', header: 'Título', required: true, example: 'Aluguel mensal' },
      { key: 'valor', header: 'Valor', required: true, example: '2500,00' },
      { key: 'data', header: 'Data', required: true, example: '01/03/2026' },
      { key: 'fluxo', header: 'Fluxo', required: true, example: 'Despesa' },
      { key: 'recorrencia', header: 'Recorrência', required: true, example: 'FREQ=MONTHLY;INTERVAL=1' },
      { key: 'centroCusto', header: 'Centro de Custo', example: 'Operacional' },
      { key: 'banco', header: 'Banco', example: 'Banco Exemplo' },
      { key: 'metodo', header: 'Método', example: 'PIX' },
      { key: 'categoria', header: 'Categoria', example: 'Despesas fixas' },
      { key: 'cliente', header: 'Cliente' },
      { key: 'favorecido', header: 'Favorecido' },
      { key: 'descricao', header: 'Descrição' },
    ],
    schema: recurringImportSchema,
    references: [
      { csvKey: 'centroCusto', targetKey: 'typeId', resourceKey: 'financeTypes', label: 'Centro de Custo' },
      { csvKey: 'banco', targetKey: 'bankId', resourceKey: 'financeBanks', label: 'Banco' },
      { csvKey: 'metodo', targetKey: 'methodId', resourceKey: 'financePaymentMethods', label: 'Método' },
      { csvKey: 'categoria', targetKey: 'categoryId', resourceKey: 'financeCategories', label: 'Categoria' },
      { csvKey: 'cliente', targetKey: 'clientId', resourceKey: 'clients', label: 'Cliente' },
      { csvKey: 'favorecido', targetKey: 'payeeId', resourceKey: 'financePayees', label: 'Favorecido' },
    ],
    mapRow: (row, resolvedIds) => ({
      title: row.title,
      description: row.descricao,
      value: Math.round(parseCsvMoney(row.valor) * 100),
      date: parseCsvDate(row.data),
      flow: parseCsvFlow(row.fluxo),
      recurrence: row.recorrencia,
      typeId: resolvedIds.typeId,
      bankId: resolvedIds.bankId,
      methodId: resolvedIds.methodId,
      categoryId: resolvedIds.categoryId,
      clientId: resolvedIds.clientId,
      payeeId: resolvedIds.payeeId,
    }),
    onCreate,
  };
}
