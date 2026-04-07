'use client';

import { FieldRow } from '@/components/common';
import { formatDate } from '@/utils/date';
import { formatRRuleToText } from '@/utils/rrule';
import { Box, Chip, Divider, Paper, Typography } from '@mui/material';
import {
  Finance,
  FinanceFlowEnum,
  FinanceStatusEnum,
  financeFlowLabels,
  financeStatusLabels,
} from '../../types/finance';

type Props = {
  finance: Finance;
};

const formatCurrency = (n?: number) =>
  ((n ?? 0) / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });

export const FinanceDetailCard: React.FC<Props> = ({ finance }) => {
  const statusMeta =
    financeStatusLabels[finance.status] ??
    ({ label: finance.status, color: 'default' } as any);
  const flowMeta =
    financeFlowLabels[finance.flow] ??
    ({ label: finance.flow, color: 'default' } as any);

  const net = finance.value - (finance.tax ?? 0) - (finance.retention ?? 0);

  return (
    <Box>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' },
          gap: 3,
        }}
      >
        {/* Left column — main info */}
        <Box>
          <Typography variant="h5" component="h2">
            {finance.title}
          </Typography>
          <Typography variant="subtitle2" color="text.secondary">
            Protocolo: {finance.protocol}
          </Typography>

          <Divider sx={{ my: 2 }} />

          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            Descrição
          </Typography>
          <Typography px={2} variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
            {finance.description || '-'}
          </Typography>

          {finance.observation && (
            <>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle1" sx={{ mb: 1 }}>
                Observações
              </Typography>
              <Typography
                px={2}
                variant="body2"
                sx={{ whiteSpace: 'pre-wrap' }}
              >
                {finance.observation}
              </Typography>
            </>
          )}

          <Divider sx={{ my: 2 }} />

          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            Valores
          </Typography>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <FieldRow
              label="Valor bruto"
              value={formatCurrency(finance.value)}
            />
            {(finance.tax ?? 0) > 0 && (
              <FieldRow label="Impostos" value={formatCurrency(finance.tax)} />
            )}
            {(finance.retention ?? 0) > 0 && (
              <FieldRow
                label="Retenção"
                value={formatCurrency(finance.retention)}
              />
            )}
            {((finance.tax ?? 0) > 0 || (finance.retention ?? 0) > 0) && (
              <>
                <Divider sx={{ my: 1 }} />
                <FieldRow
                  label="Valor líquido"
                  value={
                    <Typography variant="body2" fontWeight={600}>
                      {formatCurrency(net)}
                    </Typography>
                  }
                />
              </>
            )}
          </Paper>
        </Box>

        {/* Right column — metadata */}
        <Box>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
              Informações
            </Typography>

            <FieldRow
              label="Status"
              value={
                <Chip
                  label={statusMeta.label}
                  size="small"
                  sx={{
                    color: statusMeta.color,
                    borderColor: statusMeta.color,
                  }}
                  variant="outlined"
                />
              }
            />
            <FieldRow
              label="Fluxo"
              value={
                <Chip
                  label={flowMeta.label}
                  size="small"
                  sx={{ color: flowMeta.color, borderColor: flowMeta.color }}
                  variant="outlined"
                />
              }
            />

            <Divider sx={{ my: 1.5 }} />

            <FieldRow
              label="Centro de Custo"
              value={finance.type?.name ?? '-'}
            />
            <FieldRow label="Categoria" value={finance.category?.name ?? '-'} />
            <FieldRow label="Banco" value={finance.bank?.name ?? '-'} />
            <FieldRow label="Método" value={finance.method?.name ?? '-'} />
            {finance.payee && (
              <FieldRow label="Favorecido" value={finance.payee.name} />
            )}
            {finance.client && (
              <FieldRow label="Cliente" value={finance.client.name} />
            )}

            <Divider sx={{ my: 1.5 }} />

            <FieldRow label="Vencimento" value={formatDate(finance.date)} />
            {finance.paymentDate && (
              <FieldRow
                label="Pago em"
                value={formatDate(finance.paymentDate)}
              />
            )}

            {finance.flow === FinanceFlowEnum.TRANSFER ? null : (
              <>
                {finance.responsible && (
                  <FieldRow
                    label="Responsável"
                    value={finance.responsible.name}
                  />
                )}
                {finance.employee && (
                  <FieldRow label="Funcionário" value={finance.employee.name} />
                )}
              </>
            )}

            <Divider sx={{ my: 1.5 }} />

            {finance.createdBy && (
              <FieldRow label="Criado por" value={finance.createdBy.name} />
            )}
            <FieldRow label="Criado em" value={formatDate(finance.createdAt)} />

            {finance.status === FinanceStatusEnum.PENDING &&
              finance.approved === false && (
                <>
                  <Divider sx={{ my: 1.5 }} />
                  <Chip
                    label="Aguardando aprovação"
                    color="warning"
                    size="small"
                    sx={{ width: '100%' }}
                  />
                </>
              )}

            {finance.recurringMaster?.recurrence && (
              <>
                <Divider sx={{ my: 1.5 }} />
                <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                  Recorrência
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ fontStyle: 'italic', color: 'text.secondary' }}
                >
                  {formatRRuleToText(finance.recurringMaster.recurrence)}
                </Typography>
              </>
            )}
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};
