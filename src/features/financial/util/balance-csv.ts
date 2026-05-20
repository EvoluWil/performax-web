import {
  BalanceRow,
  BalanceTotals,
  ViewMode,
} from '../pages/balance/balance.hook';

const BRL = (v: number) => `R$ ${v.toFixed(2).replace('.', ',')}`;

const VIEW_MODE_LABELS: Record<ViewMode, string> = {
  period: 'Por Período',
  segment: 'Por Segmento',
  category: 'Por Categoria',
  type: 'Por Centro de Custo',
  client: 'Por Cliente',
};

function q(value: string | number) {
  return `"${String(value).replace(/"/g, '""')}"`;
}

export function generateBalanceCSV(
  rows: BalanceRow[],
  totals: BalanceTotals,
  viewMode: ViewMode,
) {
  if (!rows || rows.length === 0) {
    alert('Nenhum dado para exportar');
    return;
  }

  const csvRows: string[] = [];

  // Report title
  csvRows.push(q(`Balanço Financeiro — ${VIEW_MODE_LABELS[viewMode]}`));
  csvRows.push(q(`Gerado em: ${new Date().toLocaleString('pt-BR')}`));
  csvRows.push('');

  // Header
  csvRows.push(
    [
      'DIMENSÃO',
      'SEGMENTO',
      'RECEITA',
      'DESPESA',
      'BALANÇO',
      'REC. PAGO',
      'RP %',
      'DESP. PAGO',
      'DP %',
      'EM ABERTO',
    ]
      .map(q)
      .join(','),
  );

  // Data rows — group by segment header when in category mode
  let lastSegmentName: string | undefined = undefined;

  rows.forEach((r) => {
    const isNewSegment =
      viewMode === 'category' && r.segmentName !== lastSegmentName;

    if (isNewSegment) {
      lastSegmentName = r.segmentName;
      // Segment separator row
      csvRows.push(
        [
          q(r.segmentName || 'Sem segmento'),
          q(''),
          q(''),
          q(''),
          q(''),
          q(''),
          q(''),
          q(''),
          q(''),
          q(''),
        ].join(','),
      );
    }

    csvRows.push(
      [
        q(r.period),
        q(viewMode === 'category' ? r.segmentName || 'Sem segmento' : ''),
        q(BRL(r.in)),
        q(BRL(r.out)),
        q(BRL(r.balance)),
        q(BRL(r.inPaid)),
        q(`${r.inPaidPercentage.toFixed(1)}%`),
        q(BRL(r.outPaid)),
        q(`${r.outPaidPercentage.toFixed(1)}%`),
        q(BRL(r.openTotal)),
      ].join(','),
    );
  });

  // Summary section
  csvRows.push('');
  csvRows.push(q('RESUMO'));
  csvRows.push([q('Total Receitas'), q(BRL(totals.in))].join(','));
  csvRows.push([q('Total Despesas'), q(BRL(totals.out))].join(','));
  csvRows.push(
    [q('Resultado do período'), q(BRL(totals.in - totals.out))].join(','),
  );
  csvRows.push([q('Rec. Pago'), q(BRL(totals.inPaid))].join(','));
  csvRows.push([q('Desp. Pago'), q(BRL(totals.outPaid))].join(','));
  csvRows.push([q('Total em Aberto'), q(BRL(totals.openTotal))].join(','));

  // Download
  const csvContent = csvRows.join('\n');
  const blob = new Blob(['\ufeff' + csvContent], {
    type: 'text/csv;charset=utf-8;',
  });
  const link = document.createElement('a');

  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `balanco_financeiro_${new Date().getTime()}.csv`,
    );
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
