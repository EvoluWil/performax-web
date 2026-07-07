import { FinanceFlowEnum } from '@/features/financial/types/finance';

const flowLabels: Record<string, FinanceFlowEnum> = {
  in: FinanceFlowEnum.IN,
  receita: FinanceFlowEnum.IN,
  entrada: FinanceFlowEnum.IN,
  out: FinanceFlowEnum.OUT,
  despesa: FinanceFlowEnum.OUT,
  saída: FinanceFlowEnum.OUT,
  saida: FinanceFlowEnum.OUT,
};

export function parseCsvMoney(value: string): number {
  const normalized = value.replace(/\./g, '').replace(',', '.').trim();
  const amount = Number(normalized);
  if (Number.isNaN(amount)) {
    throw new Error(`Valor inválido: ${value}`);
  }
  return amount;
}

export function parseCsvDate(value: string): string {
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

export function parseCsvFlow(value: string): FinanceFlowEnum {
  const normalized = value.trim().toLowerCase();
  const mapped = flowLabels[normalized];
  if (mapped) return mapped;
  if (Object.values(FinanceFlowEnum).includes(normalized as FinanceFlowEnum)) {
    return normalized as FinanceFlowEnum;
  }
  throw new Error(`Fluxo inválido: ${value}`);
}

export function parseOptionalCsvDate(value?: string): string | undefined {
  if (!value?.trim()) return undefined;
  return parseCsvDate(value);
}

export function parseItemType(value?: string): 'PRODUCT' | 'SERVICE' {
  const normalized = (value ?? 'produto').trim().toLowerCase();
  if (['servico', 'serviço', 'service', 's'].includes(normalized)) {
    return 'SERVICE';
  }
  return 'PRODUCT';
}
