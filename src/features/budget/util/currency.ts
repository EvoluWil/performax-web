export function budgetToCents(value: number | string | undefined | null): number {
  const numeric = Number(value ?? 0);
  if (Number.isNaN(numeric)) return 0;
  return Math.round(numeric * 100);
}

export function budgetFromCents(cents: number | undefined | null): number {
  return (cents ?? 0) / 100;
}

export function formatBudgetCurrency(cents?: number | null): string {
  return budgetFromCents(cents).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}
