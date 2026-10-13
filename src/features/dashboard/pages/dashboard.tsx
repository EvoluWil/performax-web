'use client';

import { PanelChart, Section } from '@/features/dashboard/components/panel-chart';
import { useDashboard } from '@/features/dashboard/pages/dashboard.hook';
import {
  centsToAmount,
  detailPath,
  formatCents,
  formatDay,
  formatPercent,
  formatPoints,
  formatStoredMoney,
  monthKeyTitle,
  percent,
  windowLabel,
} from '@/features/dashboard/pages/format';
import { DashboardResponse } from '@/features/dashboard/types/dashboard';
import { budgetStatusLabels, BudgetStatusEnum } from '@/features/budget/types/budget';
import { occurrenceStatusLabels, OccurrenceStatusEnum } from '@/features/occurrence/types/occurrence';
import { taskStatusLabels, TaskStatusEnum } from '@/features/task/types/task';
import { Loading } from '@/components/common/loading/loading';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import {
  Box,
  Button,
  Chip,
  IconButton,
  Link as MuiLink,
  Paper,
  Typography,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { addMonths, format, parse } from 'date-fns';
import Link from 'next/link';
import { useState } from 'react';

const ANCHORS = [
  { id: 'visao-geral', label: 'Visão geral' },
  { id: 'operacao', label: 'Operação' },
  { id: 'financeiro', label: 'Financeiro' },
  { id: 'comercial', label: 'Comercial' },
];

function taskLabel(status: string) {
  return taskStatusLabels[status as TaskStatusEnum]?.label ?? status;
}

function budgetLabel(status: string) {
  return budgetStatusLabels[status as BudgetStatusEnum]?.label ?? status;
}

function occurrenceLabel(status: string) {
  return occurrenceStatusLabels[status as OccurrenceStatusEnum]?.label ?? status;
}

function moneyAxis(cents: number | null) {
  return formatCents(cents ?? 0);
}

export function DashboardPage() {
  const theme = useTheme();
  const [month, setMonth] = useState(() => format(new Date(), 'yyyy-MM'));
  const currentMonth = format(new Date(), 'yyyy-MM');
  const { data, isFetching, isError, allowed, checkingAccess } = useDashboard(month);

  function shiftMonth(delta: number) {
    const next = format(addMonths(parse(month, 'yyyy-MM', new Date()), delta), 'yyyy-MM');
    if (next > currentMonth) return;
    setMonth(next);
  }

  if (checkingAccess || (allowed && isFetching && !data)) {
    return <Loading message="Carregando painéis…" />;
  }

  if (!allowed) {
    return (
      <Typography color="text.secondary">
        Você não tem permissão para acessar os painéis.
      </Typography>
    );
  }

  if (isError || !data) {
    return (
      <Typography color="error">
        Não foi possível carregar os painéis.
      </Typography>
    );
  }

  const blocks = [data.operations, data.financial, data.commercial].filter(Boolean);

  return (
    <Box display="flex" flexDirection="column" gap={4}>
      <Box display="flex" flexWrap="wrap" alignItems="center" justifyContent="space-between" gap={2}>
        <Box>
          <Typography variant="h4" fontWeight={700}>
            Painéis
          </Typography>
          <Typography color="text.secondary">{windowLabel(data.window)}</Typography>
        </Box>
        <Box display="flex" alignItems="center" gap={1}>
          <IconButton aria-label="Mês anterior" onClick={() => shiftMonth(-1)}>
            <ChevronLeft />
          </IconButton>
          <Typography fontWeight={700} sx={{ minWidth: 160, textAlign: 'center' }}>
            {monthKeyTitle(month)}
          </Typography>
          <IconButton
            aria-label="Próximo mês"
            onClick={() => shiftMonth(1)}
            disabled={month >= currentMonth}
          >
            <ChevronRight />
          </IconButton>
        </Box>
      </Box>

      <Box display="flex" gap={1} flexWrap="wrap">
        {ANCHORS.map((item) => (
          <Button
            key={item.id}
            size="small"
            onClick={() => document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth' })}
          >
            {item.label}
          </Button>
        ))}
      </Box>

      <Overview data={data} />

      {!blocks.length ? (
        <Typography color="text.secondary">
          O cargo não tem painel liberado além do acesso à página.
        </Typography>
      ) : null}

      {data.operations ? <Operations data={data} /> : null}
      {data.financial ? <Financial data={data} /> : null}
      {data.commercial ? <Commercial data={data} primary={theme.palette.primary.main} /> : null}
    </Box>
  );
}

function Metric({
  label,
  value,
  detail,
  href,
}: {
  label: string;
  value: string;
  detail?: string;
  href?: string;
}) {
  const body = (
    <Paper sx={{ p: 2, minWidth: 180, flex: '1 1 180px' }}>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="h5" fontWeight={700}>
        {value}
      </Typography>
      {detail ? (
        <Typography variant="body2" color="text.secondary">
          {detail}
        </Typography>
      ) : null}
    </Paper>
  );

  if (!href) return body;
  return (
    <MuiLink component={Link} href={href} underline="none" color="inherit" sx={{ display: 'flex', flex: '1 1 180px' }}>
      {body}
    </MuiLink>
  );
}

function Overview({ data }: { data: DashboardResponse }) {
  const cards = data.overview.cards;
  const punctuality = cards.punctuality;
  const rate = punctuality ? percent(punctuality.onTime, punctuality.total) : null;
  const previousRate = punctuality
    ? percent(punctuality.previousOnTime, punctuality.previousTotal)
    : null;
  const delta = rate != null && previousRate != null ? rate - previousRate : null;

  return (
    <Section id="visao-geral" title="Visão geral">
      <Box display="flex" flexWrap="wrap" gap={2}>
        {cards.openTasks ? (
          <Metric
            label="OS pendentes"
            value={String(cards.openTasks.count)}
            detail={`${cards.openTasks.expired} em atraso`}
            href="/panel/tasks"
          />
        ) : null}
        {punctuality ? (
          <Metric
            label="Prazo cumprido"
            value={formatPercent(rate)}
            detail={formatPoints(delta)}
          />
        ) : null}
        {cards.overdueReceivables ? (
          <Metric
            label="Recebimentos vencidos"
            value={formatCents(cards.overdueReceivables.value)}
            detail={`${cards.overdueReceivables.count} lançamentos`}
            href={data.overview.priorities.find((item) => item.id === 'overdue-receivables')?.href}
          />
        ) : null}
        {cards.negotiation ? (
          <Metric
            label="Orçamentos em negociação"
            value={formatCents(cards.negotiation.value)}
            detail={`${cards.negotiation.count} propostas`}
            href="/panel/budgets?awaitingDecision=1"
          />
        ) : null}
        {cards.result ? (
          <Metric
            label="Resultado dos lançamentos"
            value={formatCents(cards.result.current)}
            detail={`Anterior ${formatCents(cards.result.previous)}`}
          />
        ) : null}
        {cards.impeded && cards.impeded.count > 0 ? (
          <Metric
            label="Impedidas"
            value={String(cards.impeded.count)}
            href="/panel/tasks?status=IMPEDED"
          />
        ) : null}
      </Box>

      <Box mt={3}>
        <Typography variant="h6" fontWeight={700} mb={1}>
          Prioridades
        </Typography>
        {!data.overview.priorities.length ? (
          <Typography color="text.secondary">Nada urgente neste recorte.</Typography>
        ) : (
          <Box display="flex" flexDirection="column" gap={2}>
            {data.overview.priorities.map((priority) => (
              <Paper key={priority.id} sx={{ p: 2 }}>
                <Box display="flex" justifyContent="space-between" gap={2} flexWrap="wrap">
                  <Box display="flex" alignItems="center" gap={1}>
                    <Chip
                      size="small"
                      label={priority.severity === 'high' ? 'Alta' : 'Média'}
                      color={priority.severity === 'high' ? 'error' : 'warning'}
                    />
                    <Typography fontWeight={700}>{priority.label}</Typography>
                  </Box>
                  <MuiLink component={Link} href={priority.href}>
                    Ver lista ({priority.count})
                  </MuiLink>
                </Box>
                <Typography variant="body2" color="text.secondary" mt={1}>
                  {formatStoredMoney(priority.value, priority.money)} no total
                </Typography>
                <Box component="ul" sx={{ m: 0, mt: 1, pl: 2 }}>
                  {priority.items.map((item) => (
                    <li key={item.id}>
                      <MuiLink component={Link} href={detailPath(priority.id, item.id)}>
                        {item.protocol} — {item.title}
                      </MuiLink>
                      <Typography component="span" variant="body2" color="text.secondary">
                        {' '}
                        · {formatStoredMoney(item.value, priority.money)} · {formatDay(item.date)}
                        {item.clientName ? ` · ${item.clientName}` : ''}
                      </Typography>
                    </li>
                  ))}
                </Box>
              </Paper>
            ))}
          </Box>
        )}
      </Box>
    </Section>
  );
}

function Operations({ data }: { data: DashboardResponse }) {
  const tasks = data.operations?.tasks;
  const occurrences = data.operations?.occurrences;
  const balance = tasks
    ? tasks.throughput.current.created - tasks.throughput.current.closed
    : 0;
  const rate = tasks ? percent(tasks.punctuality.onTime, tasks.punctuality.total) : null;

  return (
    <Section
      id="operacao"
      title="Operação"
      action={
        <MuiLink component={Link} href="/panel/tasks">
          Ordens de serviço
        </MuiLink>
      }
    >
      {tasks ? (
        <Box display="grid" gridTemplateColumns={{ xs: '1fr', md: '1fr 1fr' }} gap={2}>
          <PanelChart
            title="Fila por status"
            caption="Categorias que não se sobrepõem. Aguardando aprovação fica de fora desta barra."
            horizontal
            labels={tasks.queue.map((item) => taskLabel(item.status))}
            series={[{ data: tasks.queue.map((item) => item.count), label: 'OS' }]}
          />
          <PanelChart
            title="Criadas e concluídas"
            caption={`Saldo da janela: ${balance > 0 ? '+' : ''}${balance} OS. Esse saldo não é a variação exata do backlog.`}
            labels={['Anterior', 'Atual']}
            series={[
              {
                data: [tasks.throughput.previous.created, tasks.throughput.current.created],
                label: 'Criadas',
              },
              {
                data: [tasks.throughput.previous.closed, tasks.throughput.current.closed],
                label: 'Concluídas',
              },
            ]}
          />
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" color="primary" fontWeight={700}>
              Prazo cumprido
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Só entram OS fechadas com prazo vigente. Abertas com prazo vencido ficam no gráfico ao lado.
            </Typography>
            <Typography variant="h4" fontWeight={700} mt={2}>
              {formatPercent(rate)}
            </Typography>
            <Typography color="text.secondary">
              {tasks.punctuality.onTime} de {tasks.punctuality.total} concluídas no prazo
            </Typography>
            <Box display="flex" gap={1} flexWrap="wrap" mt={2}>
              <Chip label={`${tasks.attention.expired} vencidas agora`} />
              <Chip label={`${tasks.attention.impeded} impedidas`} />
              <Chip label={`${tasks.attention.emergency} emergenciais`} />
              <Chip label={`${tasks.attention.awaitingApproval} aguardando aprovação`} />
            </Box>
          </Paper>
          <PanelChart
            title="Vencidas agora, pelo mês do prazo vigente"
            caption="OS abertas cujo prazo vigente já passou. Não é o atraso que existia no fim de cada mês."
            horizontal
            labels={tasks.overdueByDueMonth.map((item) => item.month)}
            series={[{ data: tasks.overdueByDueMonth.map((item) => item.count), label: 'OS' }]}
            empty="Nenhuma OS aberta com prazo vencido."
          />
        </Box>
      ) : null}

      {occurrences ? (
        <Paper sx={{ p: 2, mt: tasks ? 2 : 0 }}>
          <Box display="flex" justifyContent="space-between" gap={2}>
            <Typography variant="h6" color="primary" fontWeight={700}>
              Ocorrências
            </Typography>
            <MuiLink component={Link} href="/panel/occurrences">
              Ver lista
            </MuiLink>
          </Box>
          <Box display="flex" gap={3} flexWrap="wrap" mt={1}>
            <Typography>{occurrences.open} abertas</Typography>
            <Typography>{occurrences.awaitingApproval} aguardando aprovação</Typography>
            <Typography>
              {occurrences.completed.current} concluídas na janela · {occurrences.completed.previous} na anterior
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" mt={1}>
            {occurrences.byStatus
              .map((item) => `${occurrenceLabel(item.status)}: ${item.count}`)
              .join(' · ')}
          </Typography>
        </Paper>
      ) : null}
    </Section>
  );
}

function Financial({ data }: { data: DashboardResponse }) {
  const financial = data.financial;
  if (!financial) return null;
  const { current, previous } = financial.comparison;

  return (
    <Section
      id="financeiro"
      title="Financeiro"
      action={
        <MuiLink component={Link} href="/panel/financial">
          Lançamentos
        </MuiLink>
      }
    >
      <Typography variant="body2" color="text.secondary" mb={2}>
        Os valores seguem a data de vencimento. Não são fluxo de caixa. Transferência, parcela e pagamento com adiantamento ficam de fora, como no balanço.
      </Typography>
      <Box display="grid" gridTemplateColumns={{ xs: '1fr', md: '1fr 1fr' }} gap={2}>
        <PanelChart
          title="Lançamentos por vencimento"
          caption="Resultado dos lançamentos na janela comparável."
          labels={['Anterior', 'Atual']}
          series={[
            {
              data: [centsToAmount(previous.in), centsToAmount(current.in)],
              label: 'Entradas',
              valueFormatter: moneyAxis,
            },
            {
              data: [centsToAmount(previous.out), centsToAmount(current.out)],
              label: 'Saídas',
              valueFormatter: moneyAxis,
            },
          ]}
        />
        <PanelChart
          title="Pagos e pendentes no vencimento"
          labels={['Anterior', 'Atual']}
          series={[
            {
              data: [centsToAmount(previous.inPaid), centsToAmount(current.inPaid)],
              label: 'Entradas pagas',
              stack: 'in',
              valueFormatter: moneyAxis,
            },
            {
              data: [centsToAmount(previous.inOpen), centsToAmount(current.inOpen)],
              label: 'Entradas pendentes',
              stack: 'in',
              valueFormatter: moneyAxis,
            },
            {
              data: [centsToAmount(previous.outPaid), centsToAmount(current.outPaid)],
              label: 'Saídas pagas',
              stack: 'out',
              valueFormatter: moneyAxis,
            },
            {
              data: [centsToAmount(previous.outOpen), centsToAmount(current.outOpen)],
              label: 'Saídas pendentes',
              stack: 'out',
              valueFormatter: moneyAxis,
            },
          ]}
        />
        <PanelChart
          title="Recebimentos vencidos"
          caption={`${formatCents(financial.overdueReceivables.value)} · ${financial.overdueReceivables.count} lançamentos`}
          horizontal
          labels={financial.overdueReceivables.buckets.map((item) => item.label)}
          series={[
            {
              data: financial.overdueReceivables.buckets.map((item) => centsToAmount(item.value)),
              label: 'Valor',
              valueFormatter: moneyAxis,
            },
          ]}
        />
        <PanelChart
          title="Contas vencidas"
          caption={`${formatCents(financial.overduePayables.value)} · ${financial.overduePayables.count} lançamentos`}
          horizontal
          labels={financial.overduePayables.buckets.map((item) => item.label)}
          series={[
            {
              data: financial.overduePayables.buckets.map((item) => centsToAmount(item.value)),
              label: 'Valor',
              valueFormatter: moneyAxis,
            },
          ]}
        />
      </Box>
      {financial.forecast ? (
        <Typography color="text.secondary" mt={2}>
          Previsto até o fim do mês, fora da comparação: entradas {formatCents(financial.forecast.in)}, saídas {formatCents(financial.forecast.out)}, resultado {formatCents(financial.forecast.result)}.
        </Typography>
      ) : null}
      <Box display="flex" gap={2} flexWrap="wrap" mt={2}>
        <Metric label="Carteira" value={formatCents(financial.wallet)} />
        <Metric
          label="Adiantamentos com saldo"
          value={formatCents(financial.advances.value)}
          detail={`${financial.advances.count} em aberto`}
        />
      </Box>
    </Section>
  );
}

function Commercial({ data, primary }: { data: DashboardResponse; primary: string }) {
  const commercial = data.commercial;
  if (!commercial) return null;
  const decided = commercial.approval.approved + commercial.approval.rejected;
  const rate = percent(commercial.approval.approved, decided);

  return (
    <Section
      id="comercial"
      title="Comercial"
      action={
        <MuiLink component={Link} href="/panel/budgets">
          Orçamentos
        </MuiLink>
      }
    >
      <Box display="grid" gridTemplateColumns={{ xs: '1fr', md: '1fr 1fr' }} gap={2}>
        <PanelChart
          title="Carteira comercial por etapa"
          caption="Distribuição do valor no status atual. Não é conversão histórica."
          horizontal
          labels={commercial.stages.map((item) => budgetLabel(item.status))}
          series={[
            {
              data: commercial.stages.map((item) => centsToAmount(item.value)),
              label: 'Valor',
              color: primary,
              valueFormatter: moneyAxis,
            },
          ]}
        />
        <PanelChart
          title="Orçamentos criados"
          labels={['Anterior', 'Atual']}
          series={[
            {
              data: [commercial.created.previous.count, commercial.created.current.count],
              label: 'Quantidade',
            },
          ]}
        />
      </Box>
      <Box display="flex" gap={2} flexWrap="wrap" mt={2}>
        <Metric
          label="Valor em negociação"
          value={formatCents(commercial.negotiation.value)}
          detail={`${commercial.negotiation.count} sem decisão`}
          href="/panel/budgets?awaitingDecision=1"
        />
        <Metric
          label="Aprovação da carteira decidida"
          value={formatPercent(rate)}
          detail={`${commercial.approval.approved} aprovados comercialmente · ${commercial.rejected} rejeitados`}
        />
        <Metric
          label="Criados na janela"
          value={formatCents(commercial.created.current.value)}
          detail={`Anterior ${formatCents(commercial.created.previous.value)}`}
        />
      </Box>
    </Section>
  );
}
