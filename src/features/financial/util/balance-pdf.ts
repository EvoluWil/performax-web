import { Content } from 'pdfmake/interfaces';
import {
  BalanceRow,
  BalanceTotals,
  ViewMode,
} from '../pages/balance/balance.hook';

const BRL = (v: number) =>
  Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

const pct = (v: number) => `${v.toFixed(1)}%`;

export const VIEW_MODE_LABELS_PDF: Record<ViewMode, string> = {
  period: 'por Período',
  segment: 'por Segmento',
  category: 'por Categoria',
  type: 'por Centro de Custo',
  client: 'por Cliente',
};

function summaryCard(label: string, value: string, color: string): Content {
  return {
    stack: [
      { text: label, fontSize: 7, color: '#666666', alignment: 'center' },
      { text: value, fontSize: 9, bold: true, color, alignment: 'center' },
    ],
    margin: [0, 0, 0, 0],
  } as Content;
}

export function buildBalancePdfContents(
  rows: BalanceRow[],
  totals: BalanceTotals,
  viewMode: ViewMode,
  primaryColor: string,
): Content[] {
  const saldo = totals.in - totals.out;

  // Summary cards row
  const summarySection: Content = {
    columns: [
      summaryCard('Total Receitas', BRL(totals.in), '#2e7d32'),
      summaryCard('Total Despesas', BRL(totals.out), '#d32f2f'),
      summaryCard(
        'Resultado do período',
        BRL(saldo),
        saldo >= 0 ? '#2e7d32' : '#d32f2f',
      ),
      summaryCard('Rec. Pago', BRL(totals.inPaid), '#1976d2'),
      summaryCard('Desp. Pago', BRL(totals.outPaid), '#1976d2'),
      summaryCard('Em Aberto', BRL(totals.openTotal), '#ed6c02'),
    ],
    columnGap: 8,
    margin: [0, 0, 0, 16],
  } as any;

  // Table header row
  const TABLE_HEADERS = [
    'DIMENSÃO',
    'RECEITA',
    'DESPESA',
    'BALANÇO',
    'REC. PAGO',
    'RP %',
    'DESP. PAGO',
    'DP %',
    'EM ABERTO',
  ];

  const tableBody: any[][] = [
    TABLE_HEADERS.map((h) => ({
      text: h,
      bold: true,
      fontSize: 7,
      fillColor: primaryColor,
      color: '#ffffff',
      margin: [2, 3, 2, 3],
    })),
  ];

  let lastSegmentName: string | undefined = undefined;

  for (const r of rows) {
    const showSegmentHeader =
      viewMode === 'category' && r.segmentName !== lastSegmentName;

    if (showSegmentHeader) {
      lastSegmentName = r.segmentName;
      tableBody.push([
        {
          text: r.segmentName || 'Sem segmento',
          bold: true,
          fontSize: 7,
          fillColor: '#eeeeee',
          colSpan: 9,
          margin: [2, 3, 2, 3],
        },
        ...Array(8).fill({ text: '' }),
      ]);
    }

    tableBody.push([
      {
        text: r.period,
        fontSize: 7,
        bold: viewMode === 'category',
        margin: [viewMode === 'category' ? 10 : 2, 2, 2, 2],
      },
      { text: BRL(r.in), fontSize: 7, color: '#2e7d32', margin: [2, 2, 2, 2] },
      { text: BRL(r.out), fontSize: 7, color: '#d32f2f', margin: [2, 2, 2, 2] },
      {
        text: BRL(r.balance),
        fontSize: 7,
        bold: true,
        color: r.balance >= 0 ? '#2e7d32' : '#d32f2f',
        margin: [2, 2, 2, 2],
      },
      { text: BRL(r.inPaid), fontSize: 7, margin: [2, 2, 2, 2] },
      { text: pct(r.inPaidPercentage), fontSize: 7, margin: [2, 2, 2, 2] },
      { text: BRL(r.outPaid), fontSize: 7, margin: [2, 2, 2, 2] },
      { text: pct(r.outPaidPercentage), fontSize: 7, margin: [2, 2, 2, 2] },
      { text: BRL(r.openTotal), fontSize: 7, margin: [2, 2, 2, 2] },
    ]);
  }

  // Totals footer row
  tableBody.push([
    {
      text: 'TOTAL GERAL',
      bold: true,
      fontSize: 7,
      fillColor: '#e0e0e0',
      margin: [2, 3, 2, 3],
    },
    {
      text: BRL(totals.in),
      bold: true,
      fontSize: 7,
      fillColor: '#e0e0e0',
      color: '#2e7d32',
      margin: [2, 3, 2, 3],
    },
    {
      text: BRL(totals.out),
      bold: true,
      fontSize: 7,
      fillColor: '#e0e0e0',
      color: '#d32f2f',
      margin: [2, 3, 2, 3],
    },
    {
      text: BRL(saldo),
      bold: true,
      fontSize: 7,
      fillColor: '#e0e0e0',
      color: saldo >= 0 ? '#2e7d32' : '#d32f2f',
      margin: [2, 3, 2, 3],
    },
    {
      text: BRL(totals.inPaid),
      bold: true,
      fontSize: 7,
      fillColor: '#e0e0e0',
      margin: [2, 3, 2, 3],
    },
    { text: '', fontSize: 7, fillColor: '#e0e0e0' },
    {
      text: BRL(totals.outPaid),
      bold: true,
      fontSize: 7,
      fillColor: '#e0e0e0',
      margin: [2, 3, 2, 3],
    },
    { text: '', fontSize: 7, fillColor: '#e0e0e0' },
    {
      text: BRL(totals.openTotal),
      bold: true,
      fontSize: 7,
      fillColor: '#e0e0e0',
      margin: [2, 3, 2, 3],
    },
  ]);

  const dataTable: Content = {
    table: {
      headerRows: 1,
      widths: [
        '*',
        'auto',
        'auto',
        'auto',
        'auto',
        'auto',
        'auto',
        'auto',
        'auto',
      ],
      body: tableBody,
    },
    layout: {
      hLineWidth: () => 0.5,
      vLineWidth: () => 0.5,
      hLineColor: () => '#cccccc',
      vLineColor: () => '#cccccc',
    },
  } as Content;

  return [summarySection, dataTable];
}
