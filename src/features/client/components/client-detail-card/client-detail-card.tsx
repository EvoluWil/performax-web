'use client';

import { FieldRow } from '@/components/common';
import { Client, ClientComplianceStatus } from '@/features/client/types';
import { formatCnpj } from '@/utils/cnpj';
import { formatDate } from '@/utils/date';
import {
  BusinessOutlined,
  CalendarTodayOutlined,
  LocationOnOutlined,
  PersonOutlined,
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

export const ClientDetailCard: React.FC<Props> = ({ client }) => {
  const compliance = client.compliance;
  const complianceStatus = compliance?.status ?? 'NO_CONTRACTS';
  const meta = complianceMeta[complianceStatus];

  const complianceLabel =
    complianceStatus === 'NON_COMPLIANT' && compliance?.overdueCount
      ? `${meta.label} (${compliance.overdueCount} parcela${compliance.overdueCount > 1 ? 's' : ''} vencida${compliance.overdueCount > 1 ? 's' : ''})`
      : meta.label;

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' },
        gap: 3,
      }}
    >
      <Box>
        <Typography variant="h5" component="h2">
          {client.name}
        </Typography>
        <Divider sx={{ my: 2 }} />
        <Stack spacing={2}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <BusinessOutlined color="action" />
            <Typography variant="subtitle2">Identificação</Typography>
          </Box>
          <FieldRow label="CNPJ:" value={formatCnpj(client.cnpj) || '-'} />
          <FieldRow
            label="Endereço:"
            value={
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.5 }}>
                <LocationOnOutlined fontSize="small" color="action" />
                <span>{client.address || '-'}</span>
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
                variant="outlined"
              />
            }
          />
        </Stack>
      </Box>

      <Box>
        <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.paper' }}>
          <Stack spacing={1}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CalendarTodayOutlined color="action" />
              <Typography variant="subtitle2">Datas</Typography>
            </Box>
            <FieldRow label="Criado em:" value={formatDate(client.createdAt)} />
            <FieldRow
              label="Atualizado em:"
              value={formatDate(client.updatedAt)}
            />
            <FieldRow
              label="Contratos:"
              value={String(client.contracts?.length ?? 0)}
            />
          </Stack>
        </Paper>
      </Box>
    </Box>
  );
};
