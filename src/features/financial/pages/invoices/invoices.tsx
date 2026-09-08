'use client';

import { Loading } from '@/components/common/loading/loading';
import { ClientDrawer } from '@/features/client/components';
import { clientService } from '@/features/client/services/client.service';
import { Client } from '@/features/client/types';
import { CompanyCadastroDrawer } from '@/features/customization/pages/settings/components/company-cadastro-drawer';
import { useFiscalConfigQuery } from '@/features/customization/hooks/queries/customization.query';
import { useCompanyModules } from '@/hooks/common/module';
import { useCompanyPermissions } from '@/hooks/common/permission';
import { formatDate } from '@/utils/date';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import { KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Chip,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Link,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { endOfMonth, format, startOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Fragment, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { financeStatusLabels } from '../../types/finance';
import {
  InvoiceRow,
  serviceInvoiceService,
} from '../../services/service-invoice.service';
import { InvoiceReviewDrawer } from './invoice-review-drawer';

const BRL = (cents: number) =>
  Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
    cents / 100,
  );

const INVOICE_STATUS = [
  { value: '', label: 'Todos' },
  { value: 'NONE', label: 'Sem nota' },
  { value: 'PROCESSING', label: 'Em processamento' },
  { value: 'AUTHORIZED', label: 'Autorizada' },
  { value: 'REJECTED', label: 'Rejeitada' },
  { value: 'ERROR', label: 'Erro' },
];

const STATUS_COLOR: Record<string, 'default' | 'success' | 'warning' | 'error' | 'info'> = {
  PROCESSING: 'info',
  AUTHORIZED: 'success',
  REJECTED: 'error',
  ERROR: 'error',
  PENDING: 'warning',
};

function monthRange(year: number, month: number) {
  const date = new Date(year, month, 1);
  return {
    from: startOfMonth(date).toISOString(),
    to: endOfMonth(date).toISOString(),
  };
}

export function FinanceInvoices() {
  const queryClient = useQueryClient();
  const { hasModule, isLoading: modulesLoading } = useCompanyModules();
  const { hasPermission } = useCompanyPermissions();
  const fiscalEnabled = hasModule('fiscal');
  const canWriteFiscal = hasPermission('fiscal', 'write');
  const now = new Date();
  const [cursor, setCursor] = useState({
    year: now.getFullYear(),
    month: now.getMonth(),
  });
  const [invoiceStatus, setInvoiceStatus] = useState('');
  const [financeStatus, setFinanceStatus] = useState('');
  const [openId, setOpenId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [reviewIds, setReviewIds] = useState<string[] | null>(null);
  const [excludeAlert, setExcludeAlert] = useState(false);
  const [companyOpen, setCompanyOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  const range = useMemo(
    () => monthRange(cursor.year, cursor.month),
    [cursor.month, cursor.year],
  );

  const { data, isLoading } = useQuery({
    queryKey: ['service-invoices', range.from, range.to, invoiceStatus, financeStatus],
    queryFn: () =>
      serviceInvoiceService.list({
        ...range,
        invoiceStatus: invoiceStatus || undefined,
        financeStatus: financeStatus || undefined,
      }),
    refetchOnWindowFocus: false,
    enabled: fiscalEnabled,
  });

  const { data: fiscalConfig } = useFiscalConfigQuery({
    enabled: canWriteFiscal && companyOpen,
  });

  const refresh = () =>
    queryClient.invalidateQueries({ queryKey: ['service-invoices'] });

  const reviewRows = useMemo(
    () => (data?.rows ?? []).filter((row) => reviewIds?.includes(row.clientId)),
    [data?.rows, reviewIds],
  );

  const shiftMonth = (direction: 1 | -1) => {
    setCursor((current) => {
      const date = new Date(current.year, current.month + direction, 1);
      return { year: date.getFullYear(), month: date.getMonth() };
    });
  };

  const openReview = (rows: InvoiceRow[]) => {
    const ids = rows.filter((row) => row.amount > 0).map((row) => row.clientId);
    if (!ids.length) {
      toast.info('Nenhum lançamento a emitir');
      return;
    }
    setReviewIds(ids);
  };

  const emitReviewed = async (clientIds: string[]) => {
    if (!clientIds.length) {
      toast.info('Nenhum cliente em conformidade para emitir');
      return;
    }
    if (!data?.readyForEmission) {
      toast.error(data?.blocker || 'Cadastro da empresa incompleto para emitir');
      return;
    }

    setBusy(true);
    try {
      if (clientIds.length === 1) {
        await serviceInvoiceService.issue({
          clientId: clientIds[0],
          ...range,
          financeStatus: financeStatus || undefined,
        });
        toast.success('Emissão enviada');
      } else {
        const result = await serviceInvoiceService.issueBatch({
          ...range,
          financeStatus: financeStatus || undefined,
          clientIds,
        });
        toast.success(`${result.issued?.length ?? 0} emissão(ões) enviada(s)`);
      }
      setReviewIds(null);
      await refresh();
    } catch {
      // interceptor shows the error
    } finally {
      setBusy(false);
    }
  };

  const requestIssue = () => {
    const blocked = reviewRows.filter((row) => row.reason);
    if (blocked.length) {
      setExcludeAlert(true);
      return;
    }
    void emitReviewed(reviewRows.map((row) => row.clientId));
  };

  const confirmExclude = async () => {
    const remaining = reviewRows.filter((row) => !row.reason).map((row) => row.clientId);
    setExcludeAlert(false);
    setReviewIds(remaining.length ? remaining : null);
    await emitReviewed(remaining);
  };

  const openClientCadastro = async (clientId: string) => {
    try {
      const client = await clientService.getById(clientId);
      setEditingClient(client);
    } catch {
      toast.error('Não foi possível abrir o cadastro do cliente');
    }
  };

  const pendingCount = (data?.rows ?? []).filter((row) => row.amount > 0).length;
  const blockedClients = reviewRows.filter((row) => row.reason);

  if (!modulesLoading && !fiscalEnabled) {
    return (
      <Alert severity="info">
        O módulo de notas fiscais não está habilitado para esta empresa.
      </Alert>
    );
  }

  return (
    <Box display="flex" flexDirection="column" gap={3}>
      {isLoading && <Loading fullScreen message="Carregando emissões..." />}
      <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
        <Box>
          <Typography variant="h5" color="primary" fontWeight="bold">
            Emissões
          </Typography>
          {canWriteFiscal && (
            <Link
              component="button"
              type="button"
              underline="hover"
              onClick={() => setCompanyOpen(true)}
            >
              Cadastro da empresa
            </Link>
          )}
        </Box>
        <Button
          variant="contained"
          onClick={() => openReview(data?.rows ?? [])}
          disabled={busy || pendingCount === 0 || !canWriteFiscal}
        >
          Emitir em massa
        </Button>
      </Box>

      <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
        <IconButton onClick={() => shiftMonth(-1)}>
          <ChevronLeft />
        </IconButton>
        <Typography variant="h6">
          {format(new Date(cursor.year, cursor.month, 1), 'MMMM / yyyy', { locale: ptBR })}
        </Typography>
        <IconButton onClick={() => shiftMonth(1)}>
          <ChevronRight />
        </IconButton>
        <TextField
          select
          size="small"
          label="Status da nota"
          value={invoiceStatus}
          onChange={(event) => setInvoiceStatus(event.target.value)}
          sx={{ minWidth: 180 }}
        >
          {INVOICE_STATUS.map((item) => (
            <MenuItem key={item.value} value={item.value}>
              {item.label}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          size="small"
          label="Status do lançamento"
          value={financeStatus}
          onChange={(event) => setFinanceStatus(event.target.value)}
          sx={{ minWidth: 200 }}
        >
          <MenuItem value="">Todos</MenuItem>
          {Object.entries(financeStatusLabels).map(([value, meta]) => (
            <MenuItem key={value} value={value}>
              {meta.label}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      {data?.blocker && <Alert severity="warning">{data.blocker}</Alert>}

      <Paper variant="outlined">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell />
              <TableCell>Cliente</TableCell>
              <TableCell>A emitir</TableCell>
              <TableCell>Lançamentos</TableCell>
              <TableCell>Nota</TableCell>
              <TableCell />
            </TableRow>
          </TableHead>
          <TableBody>
            {(data?.rows ?? []).map((row) => (
              <Fragment key={row.clientId}>
                <TableRow hover>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() =>
                        setOpenId(openId === row.clientId ? null : row.clientId)
                      }
                    >
                      {openId === row.clientId ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                    </IconButton>
                  </TableCell>
                  <TableCell>{row.clientName}</TableCell>
                  <TableCell>{BRL(row.amount)}</TableCell>
                  <TableCell>{row.financeCount}</TableCell>
                  <TableCell>
                    {row.invoiceStatus ? (
                      <Chip
                        size="small"
                        label={INVOICE_STATUS.find((item) => item.value === row.invoiceStatus)?.label ?? row.invoiceStatus}
                        color={STATUS_COLOR[row.invoiceStatus] ?? 'default'}
                      />
                    ) : (
                      <Chip size="small" label="Sem nota" />
                    )}
                    {row.reason && (
                      <Typography variant="caption" display="block" color="text.secondary">
                        {row.reason}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button
                      size="small"
                      variant="outlined"
                      disabled={row.amount <= 0 || busy || !canWriteFiscal}
                      onClick={() => openReview([row])}
                    >
                      Emitir
                    </Button>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell colSpan={6} sx={{ py: 0, border: 0 }}>
                    <Collapse in={openId === row.clientId}>
                      <Box py={1}>
                        {row.finances.map((finance) => (
                          <Box key={finance.id} display="flex" gap={2} py={0.5}>
                            <Typography variant="body2">{formatDate(finance.date)}</Typography>
                            <Typography variant="body2" flex={1}>{finance.title}</Typography>
                            <Typography variant="body2">{BRL(finance.value)}</Typography>
                            <Typography variant="body2" color="text.secondary">
                              {finance.invoiced ? 'Já emitido' : 'A emitir'}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    </Collapse>
                  </TableCell>
                </TableRow>
              </Fragment>
            ))}
            {!isLoading && !data?.rows?.length && (
              <TableRow>
                <TableCell colSpan={6}>Nenhum lançamento neste mês.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>

      <InvoiceReviewDrawer
        open={reviewIds !== null}
        rows={reviewRows}
        busy={busy}
        companyReady={!!data?.readyForEmission}
        onOpenCompany={canWriteFiscal ? () => setCompanyOpen(true) : undefined}
        onClose={() => setReviewIds(null)}
        onCompleteClient={openClientCadastro}
        onConfirm={requestIssue}
      />

      <ClientDrawer
        open={!!editingClient}
        client={editingClient}
        onClose={() => setEditingClient(null)}
        onSuccess={() => {
          void refresh();
        }}
        sx={{ zIndex: (theme) => theme.zIndex.modal + 2 }}
      />

      {canWriteFiscal && (
        <CompanyCadastroDrawer
          open={companyOpen}
          config={fiscalConfig}
          onClose={() => setCompanyOpen(false)}
          onSaved={() => {
            void refresh();
          }}
          sx={{ zIndex: (theme) => theme.zIndex.modal + 1 }}
        />
      )}

      <Dialog
        open={excludeAlert}
        onClose={() => setExcludeAlert(false)}
        sx={{ zIndex: (theme) => theme.zIndex.modal + 3 }}
      >
        <DialogTitle>Clientes sem conformidade</DialogTitle>
        <DialogContent>
          <Typography>
            Os clientes sem conformidade serão removidos da listagem da emissão:
          </Typography>
          <Box component="ul" sx={{ mt: 1, mb: 0 }}>
            {blockedClients.map((row) => (
              <li key={row.clientId}>{row.clientName}</li>
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExcludeAlert(false)}>Cancelar</Button>
          <Button variant="contained" onClick={() => void confirmExclude()}>
            Continuar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
