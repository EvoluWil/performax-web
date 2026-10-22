import { Filter } from 'nestjs-prisma-querybuilder-interface';
import { buildTextSearchOrFilter } from '@/utils/query';

/** Parses a search box value as BRL; returns centavos or null when not numeric. */
export function parseFinanceSearchValueCents(term: string): number | null {
  const trimmed = term.trim();
  if (!trimmed || !/^[\d.,]+$/.test(trimmed)) {
    return null;
  }

  const normalized = trimmed.replace(/\./g, '').replace(',', '.');
  const amount = Number(normalized);
  if (Number.isNaN(amount)) {
    return null;
  }

  return Math.round(amount * 100);
}

/** OR search: title, description, protocol (contains) and value (exact centavos when term is monetary). */
export function buildFinanceListSearchOrFilter(term: string): Filter {
  const items = buildTextSearchOrFilter(term, [
    'title',
    'description',
    'protocol',
  ]);

  const valueCents = parseFinanceSearchValueCents(term);
  if (valueCents !== null) {
    items.push({
      path: 'value',
      operator: 'equals',
      value: valueCents,
    });
  }

  return items;
}
