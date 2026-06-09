import { formatDate } from '@/utils/date';
import { KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material';
import {
  Box,
  Chip,
  Collapse,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { Fragment, useState } from 'react';
import { BalanceRow, ViewMode } from '../../pages/balance/balance.hook';
import {
  Finance,
  FinanceFlowEnum,
  financeFlowLabels,
  financeStatusLabels,
} from '../../types/finance';

const BRL = (v: number) =>
  Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

const pct = (v: number) => `${v.toFixed(1)}%`;

const TABLE_HEADERS = [
  '',
  'DIMENSÃO',
  'RECEITA',
  'DESPESA',
  'RESULTADO DO PERÍODO',
  'REC. PAGO',
  'RP %',
  'DESP. PAGO',
  'DP %',
  'EM ABERTO',
];

const ENTRY_HEADERS = [
  'DATA',
  'TÍTULO',
  'FLUXO',
  'VALOR',
  'STATUS',
  'CATEGORIA',
  'CLIENTE',
];

const VIEW_MODE_LABELS: Record<ViewMode, string> = {
  period: 'por Período',
  segment: 'por Segmento',
  category: 'por Categoria',
  type: 'por Centro de Custo',
  client: 'por Cliente',
};

function EntryRow({ finance }: { finance: Finance }) {
  const flowMeta = financeFlowLabels[finance.flow] ?? {
    label: finance.flow,
    color: 'default',
  };
  const statusMeta = financeStatusLabels[finance.status] ?? {
    label: finance.status,
    color: 'default',
  };

  return (
    <TableRow hover>
      <TableCell sx={{ whiteSpace: 'nowrap', fontSize: 12 }}>
        {formatDate(finance.date)}
      </TableCell>
      <TableCell sx={{ fontSize: 12 }}>{finance.title}</TableCell>
      <TableCell>
        <Chip
          label={flowMeta.label}
          size="small"
          variant="outlined"
          sx={{
            color: flowMeta.color === 'success' ? 'success.main' : 'error.main',
            borderColor:
              flowMeta.color === 'success' ? 'success.main' : 'error.main',
            fontSize: 11,
          }}
        />
      </TableCell>
      <TableCell
        sx={{
          fontSize: 12,
          fontWeight: 600,
          color:
            finance.flow === FinanceFlowEnum.IN ? 'success.main' : 'error.main',
          whiteSpace: 'nowrap',
        }}
      >
        {BRL((finance.value ?? 0) / 100)}
      </TableCell>
      <TableCell>
        <Chip
          label={statusMeta.label}
          size="small"
          variant="outlined"
          sx={{
            color: statusMeta.color,
            borderColor: statusMeta.color,
            fontSize: 11,
          }}
        />
      </TableCell>
      <TableCell sx={{ fontSize: 12 }}>
        {finance.category?.name ?? '-'}
      </TableCell>
      <TableCell sx={{ fontSize: 12 }}>{finance.client?.name ?? '-'}</TableCell>
    </TableRow>
  );
}

function CollapsibleRow({
  row,
  viewMode,
}: {
  row: BalanceRow;
  index: number;
  viewMode: ViewMode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <TableRow
        hover
        sx={{
          cursor: 'pointer',
          '& > *': { borderBottom: open ? 'none' : undefined },
        }}
        onClick={() => setOpen((v) => !v)}
      >
        <TableCell padding="checkbox">
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              setOpen((v) => !v);
            }}
          >
            {open ? (
              <KeyboardArrowUp fontSize="small" />
            ) : (
              <KeyboardArrowDown fontSize="small" />
            )}
          </IconButton>
        </TableCell>
        <TableCell
          sx={{
            whiteSpace: 'nowrap',
            fontWeight: 600,
            pl: viewMode === 'category' ? 3 : undefined,
          }}
        >
          {row.period}
        </TableCell>
        <TableCell sx={{ color: 'success.main' }}>{BRL(row.in)}</TableCell>
        <TableCell sx={{ color: 'error.main' }}>{BRL(row.out)}</TableCell>
        <TableCell
          sx={{
            color: row.balance >= 0 ? 'success.main' : 'error.main',
            fontWeight: 600,
          }}
        >
          {BRL(row.balance)}
        </TableCell>
        <TableCell>{BRL(row.inPaid)}</TableCell>
        <TableCell>{pct(row.inPaidPercentage)}</TableCell>
        <TableCell>{BRL(row.outPaid)}</TableCell>
        <TableCell>{pct(row.outPaidPercentage)}</TableCell>
        <TableCell>{BRL(row.openTotal)}</TableCell>
      </TableRow>

      <TableRow>
        <TableCell
          colSpan={10}
          sx={{ p: 0, borderBottom: open ? undefined : 'none' }}
        >
          <Collapse in={open} unmountOnExit>
            <Box sx={{ bgcolor: 'grey.50', px: 3, py: 1.5 }}>
              <Typography
                variant="caption"
                fontWeight={700}
                color="text.secondary"
                mb={1}
                display="block"
              >
                Lançamentos ({row.finances.length})
              </Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    {ENTRY_HEADERS.map((h) => (
                      <TableCell
                        key={h}
                        sx={{
                          fontWeight: 700,
                          fontSize: 11,
                          color: 'primary.main',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {h}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {row.finances
                    .slice()
                    .sort(
                      (a, b) =>
                        new Date(a.date).getTime() - new Date(b.date).getTime(),
                    )
                    .map((f) => (
                      <EntryRow key={f.id} finance={f} />
                    ))}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}

type Props = {
  rows: BalanceRow[];
  viewMode: ViewMode;
};

export function BalanceTable({ rows, viewMode }: Props) {
  let lastSegmentName: string | undefined = undefined;

  return (
    <Box component={Paper} p={2}>
      <Typography variant="h5" color="primary" fontWeight="bold" mb={2}>
        Relatório {VIEW_MODE_LABELS[viewMode]}
      </Typography>
      <Box overflow="auto">
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: 'grey.100' }}>
              {TABLE_HEADERS.map((h, i) => (
                <TableCell
                  key={i}
                  sx={{
                    color: 'primary.main',
                    fontWeight: 700,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {h}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((r, i) => {
              const showSegmentHeader =
                viewMode === 'category' && r.segmentName !== lastSegmentName;
              if (showSegmentHeader) lastSegmentName = r.segmentName;
              return (
                <Fragment key={r.period + i}>
                  {showSegmentHeader && (
                    <TableRow
                      key={`seg-${r.segmentName ?? 'none'}-${i}`}
                      sx={{ bgcolor: 'grey.100' }}
                    >
                      <TableCell
                        colSpan={10}
                        sx={{
                          fontWeight: 700,
                          color: 'text.secondary',
                          py: 0.5,
                        }}
                      >
                        {r.segmentName || 'Sem segmento'}
                      </TableCell>
                    </TableRow>
                  )}
                  <CollapsibleRow
                    key={r.period + i}
                    row={r}
                    index={i}
                    viewMode={viewMode}
                  />
                </Fragment>
              );
            })}
          </TableBody>
        </Table>
      </Box>
    </Box>
  );
}
