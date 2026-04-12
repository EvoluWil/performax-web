'use client';

import { useFormResources } from '@/hooks/use-form-resources';
import {
  FormResourcesResult,
  ResourceItem,
} from '@/services/form-resources.service';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { financeService } from '../../services/finance.service';
import {
  Finance,
  FinanceFlowEnum,
  FinanceStatusEnum,
} from '../../types/finance';

export type BalanceFilterDto = {
  dateFrom: string;
  dateTo: string;
  flow: string;
  bankId: string;
  categoryId: string;
  typeId: string;
  segmentId: string;
};

export type BalanceRow = {
  period: string;
  segmentName?: string;
  in: number;
  out: number;
  balance: number;
  inPaid: number;
  outPaid: number;
  inPaidPercentage: number;
  outPaidPercentage: number;
  inOpen: number;
  outOpen: number;
  openTotal: number;
};

export type BalanceTotals = {
  in: number;
  out: number;
  inPaid: number;
  outPaid: number;
  openTotal: number;
};

export type ViewMode = 'period' | 'segment' | 'category' | 'type';

const MONTHS_PT = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

const initialValues: BalanceFilterDto = {
  dateFrom: '',
  dateTo: '',
  flow: 'ALL',
  bankId: '',
  categoryId: '',
  typeId: '',
  segmentId: '',
};

function accumulate(row: BalanceRow, finance: Finance): void {
  const value = (finance.value ?? 0) / 100;
  const isPaid = finance.status === FinanceStatusEnum.PAID;

  if (finance.flow === FinanceFlowEnum.IN) {
    row.in += value;
    if (isPaid) row.inPaid += value;
    else row.inOpen += value;
  } else {
    row.out += value;
    if (isPaid) row.outPaid += value;
    else row.outOpen += value;
  }
}

function finalise(row: BalanceRow): void {
  row.balance = row.in - row.out;
  row.inPaidPercentage = row.in > 0 ? (row.inPaid / row.in) * 100 : 0;
  row.outPaidPercentage = row.out > 0 ? (row.outPaid / row.out) * 100 : 0;
  row.openTotal = row.inOpen + row.outOpen;
}

function emptyRow(period: string, segmentName?: string): BalanceRow {
  return {
    period,
    segmentName,
    in: 0,
    out: 0,
    balance: 0,
    inPaid: 0,
    outPaid: 0,
    inPaidPercentage: 0,
    outPaidPercentage: 0,
    inOpen: 0,
    outOpen: 0,
    openTotal: 0,
  };
}

function buildRows(
  finances: Finance[],
  viewMode: ViewMode,
  raw: FormResourcesResult,
): BalanceRow[] {
  const map = new Map<string, BalanceRow>();

  const segmentMap = new Map<string, string>(
    (raw.financeSegments ?? []).map((s: ResourceItem) => [s.id, s.name]),
  );
  const categoryMap = new Map<string, ResourceItem>(
    (raw.financeCategories ?? []).map((c: ResourceItem) => [c.id, c]),
  );
  const typeMap = new Map<string, string>(
    (raw.financeTypes ?? []).map((t: ResourceItem) => [t.id, t.name]),
  );

  for (const f of finances) {
    if (f.flow === FinanceFlowEnum.TRANSFER) continue;

    let key: string;
    let label: string;
    let segmentName: string | undefined;

    if (viewMode === 'period') {
      const date = new Date(f.date);
      const year = date.getFullYear();
      const month = date.getMonth();
      key = `${year}-${String(month).padStart(2, '0')}`;
      label = `${MONTHS_PT[month]} / ${year}`;
    } else if (viewMode === 'segment') {
      key = f.segmentId ?? '__sem_segmento__';
      label = (f.segmentId && segmentMap.get(f.segmentId)) || 'Sem segmento';
    } else if (viewMode === 'category') {
      key = f.categoryId ?? '__sem_categoria__';
      const cat = f.categoryId ? categoryMap.get(f.categoryId) : undefined;
      label = cat?.name ?? 'Sem categoria';
      if (cat?.segmentId) {
        segmentName = segmentMap.get(cat.segmentId as string) ?? '';
      }
    } else {
      key = f.typeId ?? '__sem_cc__';
      label = (f.typeId && typeMap.get(f.typeId)) || 'Sem centro de custo';
    }

    if (!map.has(key)) {
      map.set(key, emptyRow(label, segmentName));
    }

    accumulate(map.get(key)!, f);
  }

  const rows = Array.from(map.values());
  rows.forEach(finalise);

  if (viewMode === 'period') {
    rows.sort((a, b) => a.period.localeCompare(b.period));
  } else if (viewMode === 'category') {
    rows.sort((a, b) => {
      const sg = (a.segmentName ?? '').localeCompare(b.segmentName ?? '');
      return sg !== 0 ? sg : a.period.localeCompare(b.period);
    });
  } else {
    rows.sort((a, b) => a.period.localeCompare(b.period));
  }

  return rows;
}

export function useFinanceBalance() {
  const [rows, setRows] = useState<BalanceRow[]>([]);
  const [rawFinances, setRawFinances] = useState<Finance[]>([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('period');

  const { control, handleSubmit, reset } = useForm<BalanceFilterDto>({
    defaultValues: initialValues,
  });

  const { options, raw } = useFormResources([
    'financeBanks',
    'financeCategories',
    'financeTypes',
    'financeSegments',
  ]);

  const fetchBalance = handleSubmit(async (values: BalanceFilterDto) => {
    setLoading(true);
    try {
      const and: any[] = [];

      if (values.dateFrom) {
        and.push({
          path: 'date',
          operator: 'gte',
          value: new Date(values.dateFrom),
        });
      }
      if (values.dateTo) {
        and.push({
          path: 'date',
          operator: 'lte',
          value: new Date(values.dateTo),
        });
      }
      if (values.flow && values.flow !== 'ALL') {
        and.push({ path: 'flow', value: values.flow });
      }
      if (values.bankId) {
        and.push({ path: 'bankId', value: values.bankId });
      }
      if (values.categoryId) {
        and.push({ path: 'categoryId', value: values.categoryId });
      }
      if (values.typeId) {
        and.push({ path: 'typeId', value: values.typeId });
      }
      if (values.segmentId) {
        and.push({ path: 'segmentId', value: values.segmentId });
      }

      const result = await financeService.get({
        select: 'all',
        filter: and.length ? [{ and }] : undefined,
        sort: { field: 'date', criteria: 'asc' },
        limit: 5000,
      });

      const finances = result?.data ?? [];
      setRawFinances(finances);
      setRows(buildRows(finances, viewMode, raw));
    } finally {
      setLoading(false);
    }
  });

  const handleClear = () => {
    reset(initialValues);
    setRows([]);
    setRawFinances([]);
  };

  // Re-group when viewMode changes without a new fetch
  useEffect(() => {
    if (rawFinances.length > 0) {
      setRows(buildRows(rawFinances, viewMode, raw));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewMode]);

  useEffect(() => {
    fetchBalance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totals: BalanceTotals = rows.reduce(
    (acc, r) => {
      acc.in += r.in;
      acc.out += r.out;
      acc.inPaid += r.inPaid;
      acc.outPaid += r.outPaid;
      acc.openTotal += r.openTotal;
      return acc;
    },
    { in: 0, out: 0, inPaid: 0, outPaid: 0, openTotal: 0 },
  );

  return {
    control,
    fetchBalance,
    handleClear,
    rows,
    loading,
    totals,
    options,
    viewMode,
    setViewMode,
  };
}
