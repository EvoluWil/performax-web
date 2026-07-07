import type { CsvImportConfig } from '@/components/csv-import';
import type { FinanceFormDto } from '@/features/financial/schemas/finance-drawer.schema';
import { FinanceFlowEnum } from '@/features/financial/types/finance';
import * as yup from 'yup';

export type FinanceImportRow = {
  title: string;
  value: string;
  date: string;
  flow: string;
  centroCusto: string;
  banco: string;
  metodo: string;
  categoria?: string;
  segmento?: string;
  cliente?: string;
  funcionario?: string;
  favorecido?: string;
  responsavel?: string;
  descricao?: string;
  observacao?: string;
};

const flowLabels: Record<string, FinanceFlowEnum> = {
  in: FinanceFlowEnum.IN,
  receita: FinanceFlowEnum.IN,
  entrada: FinanceFlowEnum.IN,
  out: FinanceFlowEnum.OUT,
  despesa: FinanceFlowEnum.OUT,
  saída: FinanceFlowEnum.OUT,
  saida: FinanceFlowEnum.OUT,
};

function parseFlow(value: string): FinanceFlowEnum {
  const normalized = value.trim().toLowerCase();
  const mapped = flowLabels[normalized];
  if (mapped) return mapped;
  if (Object.values(FinanceFlowEnum).includes(normalized as FinanceFlowEnum)) {
    return normalized as FinanceFlowEnum;
  }
  throw new Error(`Fluxo inválido: ${value}`);
}

function parseMoney(value: string): number {
  const normalized = value.replace(/\./g, '').replace(',', '.').trim();
  const amount = Number(normalized);
  if (Number.isNaN(amount)) {
    throw new Error(`Valor inválido: ${value}`);
  }
  return amount;
}

function parseDate(value: string): string {
  const trimmed = value.trim();
  const brMatch = trimmed.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (brMatch) {
    const [, day, month, year] = brMatch;
    return new Date(`${year}-${month}-${day}T12:00:00`).toISOString();
  }
  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`Data inválida: ${value}`);
  }
  return parsed.toISOString();
}

const financeImportSchema = yup.object().shape({
  title: yup.string().required('Título é obrigatório'),
  value: yup.string().required('Valor é obrigatório'),
  date: yup.string().required('Data é obrigatória'),
  flow: yup.string().required('Fluxo é obrigatório'),
  centroCusto: yup.string().required('Centro de custo é obrigatório'),
  banco: yup.string().required('Banco é obrigatório'),
  metodo: yup.string().required('Método é obrigatório'),
  categoria: yup.string().optional(),
  segmento: yup.string().optional(),
  cliente: yup.string().optional(),
  funcionario: yup.string().optional(),
  favorecido: yup.string().optional(),
  responsavel: yup.string().optional(),
  descricao: yup.string().optional(),
  observacao: yup.string().optional(),
}) as yup.ObjectSchema<FinanceImportRow>;

export function createFinanceCsvImportConfig(
  onCreate: (row: FinanceFormDto & { value: number }) => Promise<unknown>,
): CsvImportConfig<FinanceImportRow, FinanceFormDto & { value: number }> {
  return {
    entityLabel: 'lançamentos financeiros',
    columns: [
      { key: 'title', header: 'Título', required: true, example: 'Pagamento fornecedor' },
      { key: 'value', header: 'Valor', required: true, example: '1500,00' },
      { key: 'date', header: 'Data', required: true, example: '15/03/2026' },
      { key: 'flow', header: 'Fluxo', required: true, example: 'Despesa' },
      { key: 'centroCusto', header: 'Centro de Custo', required: true, example: 'Operacional' },
      { key: 'banco', header: 'Banco', required: true, example: 'Banco Exemplo' },
      { key: 'metodo', header: 'Método', required: true, example: 'PIX' },
      { key: 'categoria', header: 'Categoria', example: 'Despesas administrativas' },
      { key: 'segmento', header: 'Segmento', example: 'Administrativo' },
      { key: 'cliente', header: 'Cliente', example: 'Empresa Exemplo Ltda' },
      { key: 'funcionario', header: 'Funcionário', example: 'João Silva' },
      { key: 'favorecido', header: 'Favorecido', example: 'Fornecedor XYZ' },
      { key: 'responsavel', header: 'Responsável', example: 'Maria Souza' },
      { key: 'descricao', header: 'Descrição', example: 'Referente à NF 123' },
      { key: 'observacao', header: 'Observação' },
    ],
    schema: financeImportSchema,
    references: [
      {
        csvKey: 'centroCusto',
        targetKey: 'typeId',
        resourceKey: 'financeTypes',
        label: 'Centro de Custo',
        required: true,
      },
      {
        csvKey: 'banco',
        targetKey: 'bankId',
        resourceKey: 'financeBanks',
        label: 'Banco',
        required: true,
      },
      {
        csvKey: 'metodo',
        targetKey: 'methodId',
        resourceKey: 'financePaymentMethods',
        label: 'Método',
        required: true,
      },
      {
        csvKey: 'categoria',
        targetKey: 'categoryId',
        resourceKey: 'financeCategories',
        label: 'Categoria',
      },
      {
        csvKey: 'segmento',
        targetKey: 'segmentId',
        resourceKey: 'financeSegments',
        label: 'Segmento',
      },
      {
        csvKey: 'cliente',
        targetKey: 'clientId',
        resourceKey: 'clients',
        label: 'Cliente',
      },
      {
        csvKey: 'funcionario',
        targetKey: 'employeeId',
        resourceKey: 'employees',
        label: 'Funcionário',
      },
      {
        csvKey: 'favorecido',
        targetKey: 'payeeId',
        resourceKey: 'financePayees',
        label: 'Favorecido',
      },
      {
        csvKey: 'responsavel',
        targetKey: 'responsibleId',
        resourceKey: 'users',
        label: 'Responsável',
      },
    ],
    mapRow: (row, resolvedIds) => ({
      title: row.title,
      description: row.descricao,
      observation: row.observacao,
      value: Math.round(parseMoney(row.value) * 100),
      date: parseDate(row.date),
      flow: parseFlow(row.flow),
      typeId: resolvedIds.typeId,
      bankId: resolvedIds.bankId as string,
      methodId: resolvedIds.methodId as string,
      categoryId: resolvedIds.categoryId,
      segmentId: resolvedIds.segmentId,
      clientId: resolvedIds.clientId,
      employeeId: resolvedIds.employeeId,
      payeeId: resolvedIds.payeeId,
      responsibleId: resolvedIds.responsibleId,
    }),
    onCreate,
  };
}
