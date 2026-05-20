import { Box, Paper, Typography } from '@mui/material';
import { BalanceTotals } from '../../pages/balance/balance.hook';

const BRL = (v: number) =>
  Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

type SummaryCardProps = {
  label: string;
  value: number;
  positive?: boolean;
};

function SummaryCard({ label, value, positive }: SummaryCardProps) {
  const isPositive = positive ?? value >= 0;
  const color = isPositive ? 'success' : 'error';
  return (
    <Box
      textAlign="center"
      p={2}
      bgcolor={`${color}.light`}
      borderRadius={2}
      minWidth={150}
      flex={1}
    >
      <Typography variant="h6" color={`${color}.dark`}>
        {label}
      </Typography>
      <Typography variant="h4" color={`${color}.dark`} fontWeight="bold">
        {BRL(value)}
      </Typography>
    </Box>
  );
}

type Props = {
  totals: BalanceTotals;
};

export function BalanceSummary({ totals }: Props) {
  const saldo = totals.in - totals.out;
  return (
    <Paper sx={{ bgcolor: 'grey.50' }}>
      <Typography
        variant="h5"
        color="primary"
        fontWeight="bold"
        textAlign="center"
        mb={2}
      >
        Resumo do Balancete
      </Typography>
      <Box display="flex" justifyContent="space-around" flexWrap="wrap" gap={2}>
        <SummaryCard label="Total Receitas" value={totals.in} positive />
        <SummaryCard
          label="Total Despesas"
          value={totals.out}
          positive={false}
        />
        <SummaryCard label="Resultado do período" value={saldo} />
      </Box>
    </Paper>
  );
}
