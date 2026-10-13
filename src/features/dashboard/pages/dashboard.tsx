'use client';

import { Empty, PageTitle } from '@/components/common';
import { Loading } from '@/components/common/loading/loading';
import { MetricCard } from '@/features/dashboard/components/metric-card';
import { MonthSwitch } from '@/features/dashboard/components/month-switch';
import { IndicatorEmpty } from '@/features/dashboard/components/indicator';
import { PanelChart, PanelSurface } from '@/features/dashboard/components/panel-chart';
import { PriorityList } from '@/features/dashboard/components/priority-list';
import { Section } from '@/features/dashboard/components/section';
import { SectionNav } from '@/features/dashboard/components/section-nav';
import { statusColor } from '@/features/dashboard/components/status-color';
import { StatusChip } from '@/features/dashboard/components/status-chip';
import { useDashboard } from '@/features/dashboard/pages/dashboard.hook';
import {
  centsToAmount,
  formatCents,
  formatPercent,
  formatPoints,
  monthKeyTitle,
  percent,
} from '@/features/dashboard/pages/format';
import { DashboardResponse } from '@/features/dashboard/types/dashboard';
import { budgetStatusLabels, BudgetStatusEnum } from '@/features/budget/types/budget';
import { occurrenceStatusLabels, OccurrenceStatusEnum } from '@/features/occurrence/types/occurrence';
import { taskStatusLabels, TaskStatusEnum } from '@/features/task/types/task';
import { CheckCircleOutline } from '@mui/icons-material';
import { Box, Button, Paper, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { addMonths, format, parse } from 'date-fns';
import Link from 'next/link';
import { useState } from 'react';

function taskLabel(status: string) {
  return taskStatusLabels[status as TaskStatusEnum]?.label ?? status;
}

function budgetLabel(status: string) {
  return budgetStatusLabels[status as BudgetStatusEnum]?.label ?? status;
}

function moneyAxis(amount: number | null) {
  return (amount ?? 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

export function DashboardPage() {
  const [month, setMonth] = useState(() => format(new Date(), 'yyyy-MM'));
  const [active, setActive] = useState('visao-geral');
  const currentMonth = format(new Date(), 'yyyy-MM');
  const { data, isFetching, isError, allowed, checkingAccess, refetch } = useDashboard(month);

  function shiftMonth(delta: number) {
    const next = format(addMonths(parse(month, 'yyyy-MM', new Date()), delta), 'yyyy-MM');
    if (next > currentMonth) return;
    setMonth(next);
  }

  function selectSection(id: string) {
    setActive(id);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  }

  const anchors = [
    { id: 'visao-geral', label: 'Visão geral' },
    ...(data?.operations ? [{ id: 'operacao', label: 'Operação' }] : []),
    ...(data?.financial ? [{ id: 'financeiro', label: 'Financeiro' }] : []),
    ...(data?.commercial ? [{ id: 'comercial', label: 'Comercial' }] : []),
  ];

  return (
    <Box display="flex" flexDirection="column" gap={3}>
      <PageTitle
        title="Dashboard"
        subtitle={data ? data.window.label : 'Visão do mês'}
      />

      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        gap={2}
        flexWrap="wrap"
      >
        <MonthSwitch
          label={monthKeyTitle(month)}
          onPrevious={() => shiftMonth(-1)}
          onNext={() => shiftMonth(1)}
          disableNext={month >= currentMonth}
        />
        {data ? (
          <SectionNav items={anchors} active={active} onSelect={selectSection} />
        ) : null}
      </Box>

      {(checkingAccess || (allowed && isFetching && !data)) && (
        <Loading message="Carregando dashboard..." />
      )}

      {!checkingAccess && !allowed ? (
        <Empty
          message="Você não tem permissão para acessar o dashboard."
          showReloadButton={false}
        />
      ) : null}

      {!checkingAccess && allowed && isError && !data ? (
        <Empty
          message="Não foi possível carregar o dashboard."
          onReload={async () => {
            await refetch();
          }}
        />
      ) : null}

      {data ? (
        <>
          <Overview data={data} />
          {!data.operations && !data.financial && !data.commercial ? (
            <Empty
              message="O cargo não tem seção liberada além do acesso à página."
              showReloadButton={false}
            />
          ) : null}
          {data.operations ? <Operations data={data} /> : null}
          {data.financial ? <Financial data={data} /> : null}
          {data.commercial ? <Commercial data={data} /> : null}
        </>
      ) : null}
    </Box>
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
  const receivables = data.overview.priorities.find(
    (item) => item.id === 'overdue-receivables',
  );

  return (
    <Section id="visao-geral" title="Visão geral">
      <Paper sx={{ bgcolor: 'grey.50', p: 2, mb: 3 }}>
        <Box display="flex" justifyContent="space-around" flexWrap="wrap" gap={2}>
          {cards.openTasks ? (
            <MetricCard
              label="OS pendentes"
              value={String(cards.openTasks.count)}
              detail={`${cards.openTasks.expired} em atraso`}
              href="/panel/tasks"
            />
          ) : null}
          {punctuality ? (
            <MetricCard
              label="Prazo cumprido"
              value={punctuality.total ? formatPercent(rate) : '—'}
              detail={
                punctuality.total
                  ? formatPoints(delta)
                  : 'Sem dados suficientes para calcular o cumprimento de prazo.'
              }
              tone={punctuality.total ? 'success' : 'primary'}
            />
          ) : null}
          {cards.overdueReceivables ? (
            <MetricCard
              label="Recebimentos vencidos"
              value={formatCents(cards.overdueReceivables.value)}
              detail={
                cards.overdueReceivables.count
                  ? `${cards.overdueReceivables.count} lançamentos`
                  : 'Nenhum recebimento vencido.'
              }
              href={cards.overdueReceivables.count ? receivables?.href : undefined}
              tone={cards.overdueReceivables.count ? 'error' : 'primary'}
            />
          ) : null}
          {cards.negotiation ? (
            <MetricCard
              label="Orçamentos em negociação"
              value={formatCents(cards.negotiation.value)}
              detail={`${cards.negotiation.count} propostas`}
              href="/panel/budgets?awaitingDecision=1"
              tone="warning"
            />
          ) : null}
          {cards.result ? (
            <MetricCard
              label="Resultado dos lançamentos"
              value={formatCents(cards.result.current)}
              detail={`Anterior ${formatCents(cards.result.previous)}`}
              tone={cards.result.current >= 0 ? 'success' : 'error'}
            />
          ) : null}
          {cards.impeded ? (
            <MetricCard
              label="Impedidas"
              value={String(cards.impeded.count)}
              detail={cards.impeded.count ? undefined : 'Nenhuma na fila'}
              href={cards.impeded.count ? '/panel/tasks?status=IMPEDED' : undefined}
              tone={cards.impeded.count ? 'warning' : 'primary'}
            />
          ) : null}
        </Box>
      </Paper>

      <Typography variant="h6" color="primary" fontWeight="bold" mb={2}>
        Prioridades
      </Typography>
      <PriorityList items={data.overview.priorities} />
    </Section>
  );
}

function Operations({ data }: { data: DashboardResponse }) {
  const theme = useTheme();
  const tasks = data.operations?.tasks;
  const occurrences = data.operations?.occurrences;
  const balance = tasks
    ? tasks.throughput.current.created - tasks.throughput.current.closed
    : 0;
  const rate = tasks ? percent(tasks.punctuality.onTime, tasks.punctuality.total) : null;

  return (
    <Section id="operacao" title="Operação" href="/panel/tasks" actionLabel="Ordens de serviço">
      {tasks ? (
        <Box display="grid" gridTemplateColumns={{ xs: '1fr', md: '1fr 1fr', xl: 'repeat(4, minmax(0, 1fr))' }} gap={2}>
          <PanelChart
            title="Fila por status"
            hint="Categorias que não se sobrepõem. Aguardando aprovação fica de fora desta barra."
            horizontal
            integer
            labels={tasks.queue.map((item) => taskLabel(item.status))}
            barColors={tasks.queue.map((item) =>
              statusColor(taskStatusLabels[item.status as TaskStatusEnum]?.color, theme),
            )}
            series={[{ data: tasks.queue.map((item) => item.count), label: 'OS' }]}
            empty="Nenhuma OS na fila."
          />
          <PanelChart
            title="Criadas e concluídas"
            hint={`Saldo da janela: ${balance > 0 ? '+' : ''}${balance} OS. Esse saldo não é a variação exata do backlog.`}
            integer
            labels={['Anterior', 'Atual']}
            series={[
              {
                data: [tasks.throughput.previous.created, tasks.throughput.current.created],
                label: 'Criadas',
                color: theme.palette.primary.main,
              },
              {
                data: [tasks.throughput.previous.closed, tasks.throughput.current.closed],
                label: 'Concluídas',
                color: theme.palette.secondary.main,
              },
            ]}
            empty="Nenhuma OS criada ou concluída neste período."
          />
          <PanelSurface
            title="Prazo cumprido"
            hint="Só entram OS fechadas com prazo vigente. Abertas com prazo vencido ficam no gráfico ao lado."
          >
            {tasks.punctuality.total ? (
              <>
                <Typography variant="h4" color="primary" fontWeight="bold">
                  {formatPercent(rate)}
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={2}>
                  {tasks.punctuality.onTime} de {tasks.punctuality.total} concluídas no prazo
                </Typography>
              </>
            ) : (
              <IndicatorEmpty
                message="Sem dados suficientes para calcular o cumprimento de prazo."
                icon={<CheckCircleOutline sx={{ color: 'text.secondary', fontSize: 28 }} />}
              />
            )}
            <Box display="flex" gap={1} flexWrap="wrap">
              <StatusChip label={`${tasks.attention.expired} vencidas agora`} color="error.main" />
              <StatusChip label={`${tasks.attention.impeded} impedidas`} color="warning.main" />
              <StatusChip label={`${tasks.attention.emergency} emergenciais`} color="error.main" />
              <StatusChip
                label={`${tasks.attention.awaitingApproval} aguardando aprovação`}
                color="warning.main"
              />
            </Box>
          </PanelSurface>
          <PanelChart
            title="OS com prazo vencido"
            hint="OS abertas cujo prazo vigente já passou. Não é o atraso que existia no fim de cada mês."
            horizontal
            integer
            labels={tasks.overdueByDueMonth.map((item) => item.month)}
            series={[
              {
                data: tasks.overdueByDueMonth.map((item) => item.count),
                label: 'OS',
                color: theme.palette.error.main,
              },
            ]}
            empty="Nenhuma OS aberta com prazo vencido."
            emptyPositive
          />
        </Box>
      ) : null}

      {occurrences ? (
        <Box mt={tasks ? 2 : 0}>
          <PanelSurface title="Ocorrências">
            <Box
              display="flex"
              justifyContent="space-around"
              flexWrap="wrap"
              gap={2}
              mb={2}
              p={2}
              bgcolor="grey.50"
              borderRadius={2}
            >
              <MetricCard label="Abertas" value={String(occurrences.open)} />
              <MetricCard
                label="Aguardando aprovação"
                value={String(occurrences.awaitingApproval)}
                tone="warning"
              />
              <MetricCard
                label="Concluídas na janela"
                value={String(occurrences.completed.current)}
                detail={`Anterior ${occurrences.completed.previous}`}
                tone="success"
              />
            </Box>
            <Box display="flex" gap={1} flexWrap="wrap" alignItems="center">
              {occurrences.byStatus.map((item) => {
                const meta = occurrenceStatusLabels[item.status as OccurrenceStatusEnum];
                return (
                  <StatusChip
                    key={item.status}
                    label={`${meta?.label ?? item.status}: ${item.count}`}
                    color={statusColor(meta?.color, theme)}
                  />
                );
              })}
              <Box flexGrow={1} />
              <Button component={Link} href="/panel/occurrences" size="small" variant="outlined">
                Ver lista
              </Button>
            </Box>
          </PanelSurface>
        </Box>
      ) : null}
    </Section>
  );
}

function Financial({ data }: { data: DashboardResponse }) {
  const theme = useTheme();
  const financial = data.financial;
  if (!financial) return null;
  const { current, previous } = financial.comparison;

  return (
    <Section
      id="financeiro"
      title="Financeiro"
      hint="Os valores seguem a data de vencimento. Não são fluxo de caixa. Transferência, parcela e pagamento com adiantamento ficam de fora, como no balanço."
      href="/panel/financial"
      actionLabel="Lançamentos"
    >
      <Box display="grid" gridTemplateColumns={{ xs: '1fr', md: '1fr 1fr', xl: 'repeat(4, minmax(0, 1fr))' }} gap={2}>
        <PanelChart
          title="Lançamentos por vencimento"
          hint="Entradas e saídas pela data de vencimento na janela comparável. O resultado não é o saldo da carteira."
          labels={['Anterior', 'Atual']}
          series={[
            {
              data: [centsToAmount(previous.in), centsToAmount(current.in)],
              label: 'Entradas',
              color: theme.palette.success.main,
              valueFormatter: moneyAxis,
            },
            {
              data: [centsToAmount(previous.out), centsToAmount(current.out)],
              label: 'Saídas',
              color: theme.palette.error.main,
              valueFormatter: moneyAxis,
            },
          ]}
          empty="Nenhum lançamento no período selecionado."
        />
        <PanelChart
          title="Pagos e pendentes no vencimento"
          hint="Pagos contra pendentes e aprovados, separados em entrada e saída, pela data de vencimento."
          labels={['Anterior', 'Atual']}
          series={[
            {
              data: [centsToAmount(previous.inPaid), centsToAmount(current.inPaid)],
              label: 'Entradas pagas',
              stack: 'in',
              color: theme.palette.success.main,
              valueFormatter: moneyAxis,
            },
            {
              data: [centsToAmount(previous.inOpen), centsToAmount(current.inOpen)],
              label: 'Entradas pendentes',
              stack: 'in',
              color: theme.palette.secondary.main,
              valueFormatter: moneyAxis,
            },
            {
              data: [centsToAmount(previous.outPaid), centsToAmount(current.outPaid)],
              label: 'Saídas pagas',
              stack: 'out',
              color: theme.palette.error.main,
              valueFormatter: moneyAxis,
            },
            {
              data: [centsToAmount(previous.outOpen), centsToAmount(current.outOpen)],
              label: 'Saídas pendentes',
              stack: 'out',
              color: theme.palette.warning.main,
              valueFormatter: moneyAxis,
            },
          ]}
          empty="Nenhum lançamento no período selecionado."
        />
        <PanelChart
          title="Recebimentos vencidos"
          caption={
            financial.overdueReceivables.count
              ? `${formatCents(financial.overdueReceivables.value)} · ${financial.overdueReceivables.count} lançamentos`
              : undefined
          }
          horizontal
          labels={financial.overdueReceivables.buckets.map((item) => item.label)}
          series={[
            {
              data: financial.overdueReceivables.buckets.map((item) => centsToAmount(item.value)),
              label: 'Valor',
              color: theme.palette.error.main,
              valueFormatter: moneyAxis,
            },
          ]}
          empty="Nenhum recebimento vencido."
          emptyPositive
        />
        <PanelChart
          title="Contas vencidas"
          caption={
            financial.overduePayables.count
              ? `${formatCents(financial.overduePayables.value)} · ${financial.overduePayables.count} lançamentos`
              : undefined
          }
          horizontal
          labels={financial.overduePayables.buckets.map((item) => item.label)}
          series={[
            {
              data: financial.overduePayables.buckets.map((item) => centsToAmount(item.value)),
              label: 'Valor',
              color: theme.palette.warning.main,
              valueFormatter: moneyAxis,
            },
          ]}
          empty="Nenhuma conta vencida."
          emptyPositive
        />
      </Box>
      {financial.forecast ? (
        <Box mt={2}>
          <Typography variant="h6" color="primary" fontWeight="bold" mb={2}>
            Previsto até o fim do mês
          </Typography>
          <Paper sx={{ bgcolor: 'grey.50', p: 2 }}>
            <Box display="flex" justifyContent="space-around" flexWrap="wrap" gap={2}>
              <MetricCard
                label="Entradas"
                value={formatCents(financial.forecast.in)}
                tone="success"
              />
              <MetricCard
                label="Saídas"
                value={formatCents(financial.forecast.out)}
                tone="error"
              />
              <MetricCard
                label="Resultado"
                value={formatCents(financial.forecast.result)}
                tone={financial.forecast.result >= 0 ? 'success' : 'error'}
              />
            </Box>
          </Paper>
        </Box>
      ) : null}
      <Paper sx={{ bgcolor: 'grey.50', p: 2, mt: 2 }}>
        <Box display="flex" justifyContent="space-around" flexWrap="wrap" gap={2}>
          <MetricCard label="Carteira" value={formatCents(financial.wallet)} />
          <MetricCard
            label="Adiantamentos com saldo"
            value={formatCents(financial.advances.value)}
            detail={financial.advances.count ? `${financial.advances.count} em aberto` : 'Nenhum em aberto'}
            tone={financial.advances.count ? 'warning' : 'primary'}
          />
        </Box>
      </Paper>
    </Section>
  );
}

function Commercial({ data }: { data: DashboardResponse }) {
  const theme = useTheme();
  const commercial = data.commercial;
  if (!commercial) return null;
  const decided = commercial.approval.approved + commercial.approval.rejected;
  const rate = percent(commercial.approval.approved, decided);

  return (
    <Section id="comercial" title="Comercial" href="/panel/budgets" actionLabel="Orçamentos">
      <Box display="grid" gridTemplateColumns={{ xs: '1fr', md: '1fr 1fr' }} gap={2}>
        <PanelChart
          title="Carteira comercial por etapa"
          hint="Distribuição do valor no status atual. Não é conversão histórica."
          horizontal
          hideZeros
          labels={commercial.stages.map((item) => budgetLabel(item.status))}
          barColors={commercial.stages.map((item) =>
            statusColor(budgetStatusLabels[item.status as BudgetStatusEnum]?.color, theme),
          )}
          series={[
            {
              data: commercial.stages.map((item) => centsToAmount(item.value)),
              label: 'Valor',
              valueFormatter: moneyAxis,
            },
          ]}
          empty="Nenhum orçamento na carteira."
        />
        <PanelChart
          title="Orçamentos criados"
          integer
          labels={['Anterior', 'Atual']}
          series={[
            {
              data: [commercial.created.previous.count, commercial.created.current.count],
              label: 'Quantidade',
              color: theme.palette.primary.main,
            },
          ]}
          empty="Nenhum orçamento criado neste período."
        />
      </Box>
      <Paper sx={{ bgcolor: 'grey.50', p: 2, mt: 2 }}>
        <Box display="flex" justifyContent="space-around" flexWrap="wrap" gap={2}>
          <MetricCard
            label="Valor em negociação"
            value={formatCents(commercial.negotiation.value)}
            detail={
              commercial.negotiation.count
                ? `${commercial.negotiation.count} sem decisão`
                : 'Nenhuma proposta sem decisão.'
            }
            href={commercial.negotiation.count ? '/panel/budgets?awaitingDecision=1' : undefined}
            tone={commercial.negotiation.count ? 'warning' : 'primary'}
          />
          <MetricCard
            label="Aprovação da carteira decidida"
            value={decided ? formatPercent(rate) : '—'}
            detail={
              decided
                ? `${commercial.approval.approved} aprovados comercialmente · ${commercial.rejected} rejeitados`
                : 'Sem dados suficientes para calcular a aprovação da carteira.'
            }
            tone={decided ? 'success' : 'primary'}
          />
          <MetricCard
            label="Criados na janela"
            value={formatCents(commercial.created.current.value)}
            detail={`Anterior ${formatCents(commercial.created.previous.value)}`}
          />
        </Box>
      </Paper>
    </Section>
  );
}
