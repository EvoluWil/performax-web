'use client';

import { BaseDrawer } from '@/components/drawer';
import { formatDate } from '@/utils/date';
import {
  Box,
  Button,
  Chip,
  Stack,
  Typography,
} from '@mui/material';
import { InvoiceRow } from '../../services/service-invoice.service';

const BRL = (cents: number) =>
  Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
    cents / 100,
  );

type InvoiceReviewDrawerProps = {
  open: boolean;
  rows: InvoiceRow[];
  busy: boolean;
  companyReady: boolean;
  onOpenCompany?: () => void;
  onClose: () => void;
  onCompleteClient: (clientId: string) => void;
  onConfirm: () => void;
};

export function InvoiceReviewDrawer({
  open,
  rows,
  busy,
  companyReady,
  onOpenCompany,
  onClose,
  onCompleteClient,
  onConfirm,
}: InvoiceReviewDrawerProps) {
  return (
    <BaseDrawer
      open={open}
      setOpen={onClose}
      title="Revisar emissão"
      width={48}
      content={
        <Stack gap={2} p={2} pb={10}>
          <Typography variant="body2" color="text.secondary">
            Confira os lançamentos por cliente. Complete o cadastro de quem estiver sem conformidade antes de emitir.
          </Typography>
          {!companyReady && (
            <Typography variant="body2" color="warning.main">
              O cadastro da empresa ainda não está pronto para emitir.
              {onOpenCompany && (
                <>
                  {' '}
                  <Button size="small" onClick={onOpenCompany} sx={{ p: 0, minWidth: 0, verticalAlign: 'baseline' }}>
                    Cadastro da empresa
                  </Button>
                </>
              )}
            </Typography>
          )}
          {rows.map((row) => {
            const incomplete = Boolean(row.reason);
            return (
              <Box
                key={row.clientId}
                border="1px solid"
                borderColor="divider"
                borderRadius={1}
                p={1.5}
              >
                <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
                  <Typography fontWeight={600} flex={1}>
                    {row.clientName}
                  </Typography>
                  <Chip
                    size="small"
                    color={incomplete ? 'warning' : 'success'}
                    label={incomplete ? 'Sem conformidade' : 'Em conformidade'}
                  />
                  <Typography variant="body2">{BRL(row.amount)}</Typography>
                </Box>
                {row.reason && (
                  <Typography variant="caption" color="text.secondary" display="block" mt={0.5}>
                    {row.reason}
                  </Typography>
                )}
                {incomplete && (
                  <Button
                    size="small"
                    sx={{ mt: 1, px: 0 }}
                    onClick={() => onCompleteClient(row.clientId)}
                  >
                    Completar cadastro
                  </Button>
                )}
                <Stack mt={1} gap={0.5}>
                  {row.finances.map((finance) => (
                    <Box key={finance.id} display="flex" gap={2}>
                      <Typography variant="body2">{formatDate(finance.date)}</Typography>
                      <Typography variant="body2" flex={1}>{finance.title}</Typography>
                      <Typography variant="body2">{BRL(finance.value)}</Typography>
                    </Box>
                  ))}
                </Stack>
              </Box>
            );
          })}
          <Button
            variant="contained"
            onClick={onConfirm}
            disabled={busy || !rows.length || !companyReady}
          >
            Confirmar emissão
          </Button>
        </Stack>
      }
    />
  );
}
