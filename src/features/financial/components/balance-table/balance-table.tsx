import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { BalanceRow, ViewMode } from '../../pages/balance/balance.hook';

const BRL = (v: number) =>
  Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

const pct = (v: number) => `${v.toFixed(1)}%`;

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

const VIEW_MODE_LABELS: Record<ViewMode, string> = {
  period: 'por Período',
  segment: 'por Segmento',
  category: 'por Categoria',
  type: 'por Centro de Custo',
};

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
              {TABLE_HEADERS.map((h) => (
                <TableCell
                  key={h}
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
                <>
                  {showSegmentHeader && (
                    <TableRow
                      key={`seg-${r.segmentName ?? 'none'}-${i}`}
                      sx={{ bgcolor: 'grey.100' }}
                    >
                      <TableCell
                        colSpan={9}
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
                  <TableRow key={r.period + i} hover>
                    <TableCell
                      sx={{
                        whiteSpace: 'nowrap',
                        fontWeight: 600,
                        pl: viewMode === 'category' ? 3 : undefined,
                      }}
                    >
                      {r.period}
                    </TableCell>
                    <TableCell sx={{ color: 'success.main' }}>
                      {BRL(r.in)}
                    </TableCell>
                    <TableCell sx={{ color: 'error.main' }}>
                      {BRL(r.out)}
                    </TableCell>
                    <TableCell
                      sx={{
                        color: r.balance >= 0 ? 'success.main' : 'error.main',
                        fontWeight: 600,
                      }}
                    >
                      {BRL(r.balance)}
                    </TableCell>
                    <TableCell>{BRL(r.inPaid)}</TableCell>
                    <TableCell>{pct(r.inPaidPercentage)}</TableCell>
                    <TableCell>{BRL(r.outPaid)}</TableCell>
                    <TableCell>{pct(r.outPaidPercentage)}</TableCell>
                    <TableCell>{BRL(r.openTotal)}</TableCell>
                  </TableRow>
                </>
              );
            })}
          </TableBody>
        </Table>
      </Box>
    </Box>
  );
}
