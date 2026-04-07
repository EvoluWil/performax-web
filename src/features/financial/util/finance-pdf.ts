import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { TDocumentDefinitions } from 'pdfmake/interfaces';
import {
  Finance,
  FinanceFlowEnum,
  FinanceStatusEnum,
  financeFlowLabels,
  financeStatusLabels,
} from '../types/finance';

const fmtDate = (d: Date | string | undefined) => {
  if (!d) return '-';
  try {
    return format(new Date(d), 'dd/MM/yyyy', { locale: ptBR });
  } catch {
    return '-';
  }
};

const fmtCurrency = (cents: number) =>
  Number(cents / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });

export const generateFinancePdfObject = (
  finance: Finance | null,
): TDocumentDefinitions['content'] => {
  if (!finance) return [];

  const statusLabel =
    finance.approved === false
      ? 'Aguardando aprovação'
      : (financeStatusLabels[finance.status as FinanceStatusEnum]?.label ??
        finance.status);

  const flowLabel =
    financeFlowLabels[finance.flow as FinanceFlowEnum]?.label ?? finance.flow;

  const gross = finance.value ?? 0;
  const tax = finance.tax ?? 0;
  const retention = finance.retention ?? 0;
  const net = gross - tax - retention;

  const content: TDocumentDefinitions['content'] = [
    // ── Section header ──────────────────────────────────────────────
    {
      table: {
        headerRows: 1,
        widths: ['*'],
        body: [
          [
            {
              text: `LANÇAMENTO FINANCEIRO: ${finance.title?.toUpperCase()}`,
              alignment: 'center',
              fontSize: 12,
              bold: true,
              fillColor: '#f2f2f2',
              borderColor: ['#000', '#000', '#000', '#f2f2f2'],
            },
          ],
        ],
      },
    },

    // ── Identificação ────────────────────────────────────────────────
    {
      table: {
        headerRows: 0,
        widths: ['*', '*'],
        body: [
          [
            { text: `PROTOCOLO: ${finance.protocol}`, fontSize: 10 },
            { text: `STATUS: ${statusLabel}`, fontSize: 10 },
          ],
          [
            { text: `FLUXO: ${flowLabel}`, fontSize: 10 },
            {
              text: `VENCIMENTO: ${fmtDate(finance.date)}`,
              fontSize: 10,
            },
          ],
          [
            {
              text: `CRIADO EM: ${format(new Date(finance.createdAt), 'dd/MM/yyyy - HH:mm', { locale: ptBR })}`,
              fontSize: 10,
            },
            {
              text: finance.paymentDate
                ? `PAGO EM: ${fmtDate(finance.paymentDate)}`
                : 'PAGO EM: -',
              fontSize: 10,
            },
          ],
          [
            {
              text: `CRIADO POR: ${finance.createdBy?.name ?? '-'}`,
              fontSize: 10,
              colSpan: 2,
            },
            {},
          ],
        ],
      },
      margin: [0, 0, 0, 0],
    },

    // ── Valores ──────────────────────────────────────────────────────
    {
      table: {
        headerRows: 1,
        widths: ['*'],
        body: [
          [
            {
              text: 'VALORES',
              alignment: 'center',
              fontSize: 12,
              bold: true,
              fillColor: '#f2f2f2',
            },
          ],
        ],
      },
      margin: [0, 20, 0, 0],
    },
    {
      table: {
        headerRows: 0,
        widths: ['*', '*'],
        body: [
          [
            { text: `VALOR BRUTO: ${fmtCurrency(gross)}`, fontSize: 10 },
            { text: `IMPOSTOS: ${fmtCurrency(tax)}`, fontSize: 10 },
          ],
          [
            { text: `RETENÇÃO: ${fmtCurrency(retention)}`, fontSize: 10 },
            {
              text: `VALOR LÍQUIDO: ${fmtCurrency(net)}`,
              fontSize: 10,
              bold: true,
            },
          ],
        ],
      },
    },

    // ── Entidades relacionadas ────────────────────────────────────────
    {
      table: {
        headerRows: 1,
        widths: ['*'],
        body: [
          [
            {
              text: 'INFORMAÇÕES DO LANÇAMENTO',
              alignment: 'center',
              fontSize: 12,
              bold: true,
              fillColor: '#f2f2f2',
            },
          ],
        ],
      },
      margin: [0, 20, 0, 0],
    },
    {
      table: {
        headerRows: 0,
        widths: ['*', '*'],
        body: [
          [
            {
              text: `BANCO: ${finance.bank?.name ?? '-'}`,
              fontSize: 10,
            },
            {
              text: `MÉTODO DE PAGAMENTO: ${finance.method?.name ?? '-'}`,
              fontSize: 10,
            },
          ],
          [
            {
              text: `CENTRO DE CUSTO: ${finance.type?.name ?? '-'}`,
              fontSize: 10,
            },
            {
              text: `CATEGORIA: ${finance.category?.name ?? '-'}`,
              fontSize: 10,
            },
          ],
          [
            {
              text: `CLIENTE: ${finance.client?.name ?? '-'}`,
              fontSize: 10,
            },
            {
              text: `FAVORECIDO: ${finance.payee?.name ?? '-'}`,
              fontSize: 10,
            },
          ],
          [
            {
              text: `RESPONSÁVEL: ${finance.responsible?.name ?? '-'}`,
              fontSize: 10,
            },
            {
              text: `FUNCIONÁRIO: ${finance.employee?.name ?? '-'}`,
              fontSize: 10,
            },
          ],
        ],
      },
    },
  ];

  // ── Descrição ─────────────────────────────────────────────────────
  if (finance.description) {
    content.push(
      {
        table: {
          headerRows: 1,
          widths: ['*'],
          body: [
            [
              {
                text: 'DESCRIÇÃO',
                alignment: 'center',
                fontSize: 12,
                bold: true,
                fillColor: '#f2f2f2',
              },
            ],
          ],
        },
        margin: [0, 20, 0, 0],
      } as any,
      {
        table: {
          widths: ['*'],
          body: [[{ text: finance.description, fontSize: 10, margin: [4, 6] }]],
        },
      } as any,
    );
  }

  // ── Observação ────────────────────────────────────────────────────
  if (finance.observation) {
    content.push(
      {
        table: {
          headerRows: 1,
          widths: ['*'],
          body: [
            [
              {
                text: 'OBSERVAÇÕES',
                alignment: 'center',
                fontSize: 12,
                bold: true,
                fillColor: '#f2f2f2',
              },
            ],
          ],
        },
        margin: [0, 20, 0, 0],
      } as any,
      {
        table: {
          widths: ['*'],
          body: [[{ text: finance.observation, fontSize: 10, margin: [4, 6] }]],
        },
      } as any,
    );
  }

  return content;
};
