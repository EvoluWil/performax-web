'use client';

import { FieldRow } from '@/components/common';
import { Client, ClientComplianceStatus } from '@/features/client/types';
import { formatCnpj } from '@/utils/cnpj';
import { formatCpf } from '@/utils/cpf';
import { formatDate } from '@/utils/date';
import {
  BusinessOutlined,
  CalendarTodayOutlined,
  EmailOutlined,
  LocationOnOutlined,
  PersonOutlined,
  ReceiptOutlined,
} from '@mui/icons-material';
import { Box, Chip, Divider, Paper, Stack, Typography } from '@mui/material';

type Props = {
  client: Client;
};

const complianceMeta: Record<
  ClientComplianceStatus,
  { label: string; color: 'success' | 'error' | 'default' }
> = {
  COMPLIANT: { label: 'Adimplente', color: 'success' },
  NON_COMPLIANT: { label: 'Inadimplente', color: 'error' },
  NO_CONTRACTS: { label: 'Sem contratos', color: 'default' },
};

function formatAddress(client: Client): string {
  const fa = client.fiscalAddress;
  if (fa?.street) {
    const parts = [
      fa.street,
      fa.number,
      fa.neighborhood,
      fa.city,
      fa.state,
      fa.postalCode,
    ].filter(Boolean);
    return parts.join(', ');
  }
  return client.address || '-';
}

export const ClientDetailCard: React.FC<Props> = ({ client }) => {
  const compliance = client.compliance;
  const complianceStatus = compliance?.status ?? 'NO_CONTRACTS';
  const meta = complianceMeta[complianceStatus];
  const fiscalStatus = client.fiscalStatus;

  const complianceLabel =
    complianceStatus === 'NON_COMPLIANT' && compliance?.overdueCount
      ? `${meta.label} (${compliance.overdueCount} parcela${compliance.overdueCount > 1 ? 's' : ''} vencida${compliance.overdueCount > 1 ? 's' : ''})`
      : meta.label;

  const personType = client.personType ?? (client.cnpj ? 'PJ' : client.cpf ? 'PF' : undefined);

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' },
        gap: 3,
      }}
    >
      <Box>
        <Box display="flex" alignItems="center" gap={1} flexWrap="wrap" mb={1}>
          <Typography variant="h5" component="h2">
            {client.name}
          </Typography>
          {fiscalStatus && (
            <Chip
              icon={<ReceiptOutlined />}
              label={
                fiscalStatus.ready
                  ? 'Dados fiscais completos'
                  : `Fiscal pendente: ${fiscalStatus.missingFields.slice(0, 2).join(', ')}${fiscalStatus.missingFields.length > 2 ? '...' : ''}`
              }
              color={fiscalStatus.ready ? 'success' : 'warning'}
              size="small"
            />
          )}
        </Box>
        <Divider sx={{ my: 2 }} />
        <Stack spacing={2}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <BusinessOutlined color="action" />
            <Typography variant="subtitle2">Identificação</Typography>
          </Box>
          <FieldRow
            label="Tipo:"
            value={personType === 'PF' ? 'Pessoa Física' : personType === 'PJ' ? 'Pessoa Jurídica' : '-'}
          />
          {personType === 'PF' ? (
            <FieldRow label="CPF:" value={formatCpf(client.cpf ?? '') || '-'} />
          ) : (
            <FieldRow label="CNPJ:" value={formatCnpj(client.cnpj ?? '') || '-'} />
          )}
          <FieldRow label="E-mail:" value={client.email || '-'} />
          <FieldRow
            label="Endereço:"
            value={
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.5 }}>
                <LocationOnOutlined fontSize="small" color="action" />
                <span>{formatAddress(client)}</span>
              </Box>
            }
          />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PersonOutlined color="action" />
            <Typography variant="subtitle2">Responsável</Typography>
          </Box>
          <FieldRow
            label="Criado por:"
            value={client.createdBy?.name ?? '-'}
          />
          <FieldRow
            label="Adimplência:"
            value={
              <Chip
                label={complianceLabel}
                size="small"
                color={meta.color}
              />
            }
          />
        </Stack>
      </Box>

      <Paper variant="outlined" sx={{ p: 2, height: 'fit-content' }}>
        <Stack spacing={2}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CalendarTodayOutlined color="action" />
            <Typography variant="subtitle2">Informações</Typography>
          </Box>
          <FieldRow
            label="Cadastrado em:"
            value={formatDate(client.createdAt)}
          />
          <FieldRow
            label="Atualizado em:"
            value={formatDate(client.updatedAt)}
          />
          {client.email && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <EmailOutlined fontSize="small" color="action" />
              <Typography variant="body2">{client.email}</Typography>
            </Box>
          )}
        </Stack>
      </Paper>
    </Box>
  );
};
