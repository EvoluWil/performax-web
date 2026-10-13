import { DashboardMoney } from '@/features/dashboard/types/dashboard';
import { format, parse, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function centsToAmount(cents: number) {
  return cents / 100;
}

export function formatStoredMoney(value: number, money: DashboardMoney) {
  const amount = money === 'cents' ? centsToAmount(value) : value;
  return amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function formatCents(cents: number) {
  return formatStoredMoney(cents, 'cents');
}

export function percent(part: number, total: number) {
  if (!total) return null;
  return (part / total) * 100;
}

export function formatPercent(value: number | null) {
  if (value == null) return '—';
  return `${value.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}%`;
}

export function formatPoints(delta: number | null) {
  if (delta == null) return 'Sem base na janela anterior';
  const rounded = Math.round(delta);
  const sign = rounded > 0 ? '+' : '';
  return `${sign}${rounded.toLocaleString('pt-BR')} p.p. vs. anterior`;
}

export function monthKeyTitle(month: string) {
  const label = format(parse(month, 'yyyy-MM', new Date()), 'MMMM yyyy', { locale: ptBR });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function formatDay(iso: string | null) {
  if (!iso) return 'Sem data';
  return format(parseISO(iso), 'dd/MM/yyyy', { locale: ptBR });
}

export function detailPath(priorityId: string, id: string) {
  if (priorityId === 'overdue-receivables') return `/panel/financial/${id}`;
  if (priorityId === 'budgets-awaiting') return `/panel/budgets/${id}`;
  return `/panel/tasks/${id}`;
}
