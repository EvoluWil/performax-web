'use client';

import { ListHeader, Table } from '@/components/common';
import { Actions } from '@/components/common/table/table';
import {
  AutocompleteInput,
  CurrencyInput,
  DateInput,
  TextInput,
} from '@/components/inputs';
import { useCompanyPermissions } from '@/hooks/common/permission';
import { useFormResources } from '@/hooks/use-form-resources';
import { formatDate } from '@/utils/date';
import { DeleteOutlined, VisibilityOutlined } from '@mui/icons-material';
import {
  Box,
  Chip,
  Dialog,
  DialogActions,
  DialogTitle,
  DialogContent,
  Typography,
  Button,
  LinearProgress,
} from '@mui/material';
import { MRT_ColumnDef } from 'material-react-table';
import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { toast } from 'react-toastify';
import swal from 'sweetalert2';
import {
  useFinanceAdvanceMutation,
  useFinanceAdvancesQuery,
} from '../../hooks/queries/finance-advances.query';
import {
  financeService,
  getFinanceQuery,
} from '../../services/finance.service';
import {
  AdvanceStatusEnum,
  FinanceAdvance,
  advanceStatusLabels,
} from '../../types/finance-advance';
import {
  Finance,
  FinanceFlowEnum,
  FinanceStatusEnum,
} from '../../types/finance';

type CreateAdvanceFormDto = {
  title: string;
  description: string;
  observation: string;
  financeIds: string[];
  receivedValue: number | string;
  date: Date | null;
  bankId: string;
  methodId: string;
  typeId: string;
};

const createDefaults: CreateAdvanceFormDto = {
  title: '',
  description: '',
  observation: '',
  financeIds: [],
  receivedValue: 0,
  date: new Date(),
  bankId: '',
  methodId: '',
  typeId: '',
};

const eligibleFinancesQuery = {
  ...getFinanceQuery,
  filter: [
    { path: 'flow', value: FinanceFlowEnum.IN },
    {
      path: 'status',
      operator: 'in',
      value: [FinanceStatusEnum.PENDING, FinanceStatusEnum.APPROVED].join(';'),
    },
  ],
  limit: 500,
  page: 1,
} as const;

function formatCurrency(cents: number) {
  return (cents / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

const columns: MRT_ColumnDef<FinanceAdvance>[] = [
  { accessorKey: 'protocol', header: 'Protocolo' },
  { accessorKey: 'title', header: 'Título' },
  {
    accessorKey: 'totalValue',
    header: 'Valor nominal',
    Cell({ cell }: any) {
      return formatCurrency(cell.getValue());
    },
  },
  {
    accessorKey: 'receivedValue',
    header: 'Valor recebido',
    Cell({ cell }: any) {
      return formatCurrency(cell.getValue() ?? 0);
    },
  },
  {
    accessorKey: 'remainingValue',
    header: 'Saldo nominal',
    Cell({ cell }: any) {
      return formatCurrency(cell.getValue());
    },
  },
  {
    id: 'usedValue',
    header: 'Quitado',
    Cell({ row }: any) {
      const used = row.original.totalValue - row.original.remainingValue;
      return formatCurrency(used);
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    Cell({ cell }: any) {
      const status = cell.getValue() as AdvanceStatusEnum;
      const meta = advanceStatusLabels[status] ?? {
        label: status,
        color: 'default',
      };
      return (
        <Chip
          label={meta.label}
          size="small"
          sx={{ color: meta.color, borderColor: meta.color }}
          variant="outlined"
        />
      );
    },
  },
  {
    accessorKey: 'date',
    header: 'Data',
    Cell({ cell }: any) {
      return formatDate(cell.getValue());
    },
  },
  {
    id: 'applicationsCount',
    header: 'Lançamentos',
    Cell({ row }: any) {
      return row.original.applications?.length ?? 0;
    },
  },
];

function isEligibleForAdvance(f: Finance) {
  return (
    !f.advanceId &&
    !f.isAdvanceDeposit &&
    f.flow === FinanceFlowEnum.IN &&
    f.status !== FinanceStatusEnum.PAID &&
    f.status !== FinanceStatusEnum.CANCELLED
  );
}

export const FinanceAdvanceList = () => {
  const { data: advances, refetch } = useFinanceAdvancesQuery();
  const mutation = useFinanceAdvanceMutation();
  const [term, setTerm] = useState('');
  const [openCreate, setOpenCreate] = useState(false);
  const [detailTarget, setDetailTarget] = useState<FinanceAdvance | null>(null);

  const { hasPermission, isReady } = useCompanyPermissions();
  const canWrite = isReady && hasPermission('financial', 'write');

  const { options, setSearch } = useFormResources([
    'financeBanks',
    'financePaymentMethods',
    'financeTypes',
  ]);

  const { data: eligibleResult, isLoading: loadingEligible } = useQuery({
    queryKey: ['finances', 'advance-eligible'],
    queryFn: () => financeService.get(eligibleFinancesQuery as any),
    enabled: openCreate,
    refetchOnWindowFocus: false,
  });

  const eligibleFinances = useMemo(
    () => (eligibleResult?.data ?? []).filter(isEligibleForAdvance),
    [eligibleResult],
  );

  const financeOptions = useMemo(
    () =>
      eligibleFinances.map((f) => ({
        value: f.id,
        label: `${f.client?.name?.trim() || 'Sem cliente'} — ${f.title} (${formatCurrency(f.value)})`,
      })),
    [eligibleFinances],
  );

  const { control, handleSubmit, reset } = useForm<CreateAdvanceFormDto>({
    defaultValues: createDefaults,
  });

  const selectedFinanceIds = useWatch({ control, name: 'financeIds' }) ?? [];

  const nominalTotalCents = useMemo(() => {
    const idSet = new Set(selectedFinanceIds);
    return eligibleFinances
      .filter((f) => idSet.has(f.id))
      .reduce((sum, f) => sum + f.value, 0);
  }, [selectedFinanceIds, eligibleFinances]);

  const filtered = useMemo(
    () =>
      (advances ?? []).filter((a) =>
        a.title?.toLowerCase().includes(term.toLowerCase()),
      ),
    [advances, term],
  );

  const handleReload = async () => {
    const { data } = await refetch();
    if (data) toast.success('Dados atualizados com sucesso');
  };

  const handleOpenCreate = () => {
    reset(createDefaults);
    setOpenCreate(true);
  };

  const handleCreate = handleSubmit(async (values) => {
    if (!values.financeIds?.length) {
      toast.error('Selecione ao menos um lançamento');
      return;
    }
    const receivedValue = Math.round(Number(values.receivedValue || 0) * 100);
    if (receivedValue <= 0) {
      toast.error('Informe o valor efetivo recebido');
      return;
    }
    if (receivedValue > nominalTotalCents) {
      toast.error('Valor recebido não pode ser maior que a soma dos lançamentos');
      return;
    }
    try {
      await mutation.mutateAsync({
        type: 'create',
        data: {
          title: values.title,
          description: values.description || undefined,
          observation: values.observation || undefined,
          financeIds: values.financeIds,
          receivedValue,
          date: (values.date as Date).toISOString(),
          bankId: values.bankId,
          methodId: values.methodId,
          typeId: values.typeId || undefined,
        },
      });
      toast.success('Adiantamento criado e saldo atualizado');
      setOpenCreate(false);
    } catch {
      toast.error('Erro ao criar adiantamento');
    }
  });

  const handleDelete = (id: string) => {
    swal.fire({
      title: 'Excluir adiantamento?',
      text: 'Os lançamentos vinculados serão desvinculados e os depósitos removidos.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d32f2f',
      confirmButtonText: 'Sim, excluir',
      cancelButtonText: 'Cancelar',
      preConfirm: async () => {
        await mutation.mutateAsync({ type: 'delete', id });
        toast.success('Adiantamento excluído');
      },
    });
  };

  const canDeleteAdvance = (advance: FinanceAdvance) => {
    const apps = advance.applications ?? [];
    if (!apps.length) return true;
    return !apps.some((a) => a.status === FinanceStatusEnum.PAID);
  };

  const actions: Actions<FinanceAdvance>[] = [
    {
      icon: () => <VisibilityOutlined />,
      label: () => 'Ver lançamentos',
      onClick: (a) => setDetailTarget(a),
      condition: (a) => (a.applications?.length ?? 0) > 0,
    },
  ];
  if (canWrite) {
    actions.push({
      icon: () => <DeleteOutlined />,
      label: () => 'Excluir',
      onClick: (a) => handleDelete(a.id),
      condition: canDeleteAdvance,
    });
  }

  return (
    <>
      <Box mb={1}>
        <Typography variant="h5" color="primary" fontWeight="bold">
          ADIANTAMENTOS
        </Typography>
        <Typography variant="body2" color="text.secondary" mt={0.5}>
          Selecione lançamentos de entrada, informe o valor recebido e o
          sistema registra o caixa e os juros. Ao quitar os lançamentos
          vinculados, o saldo não é contado novamente.
        </Typography>
      </Box>

      <ListHeader
        onReload={handleReload}
        onSearch={(s) => setTerm(s)}
        onAdd={canWrite ? handleOpenCreate : undefined}
        searchTitle="Pesquise por título"
        addTitle="Novo Adiantamento"
      />

      <Table data={filtered} columns={columns} actions={actions} />

      <Dialog
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Novo Adiantamento</DialogTitle>
        <DialogContent
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            pt: '16px !important',
          }}
        >
          <Typography variant="body2" color="text.secondary">
            O valor efetivo recebido entra no saldo na criação. A diferença
            para a soma dos lançamentos gera uma saída de juros.
          </Typography>
          <AutocompleteInput
            key={openCreate ? 'advance-finance-picker' : 'advance-finance-picker-closed'}
            label="Lançamentos (entrada, não pagos)"
            name="financeIds"
            control={control}
            multiple
            options={financeOptions}
            loading={loadingEligible && financeOptions.length === 0}
          />
          <Typography variant="body2" fontWeight={600}>
            Soma dos lançamentos: {formatCurrency(nominalTotalCents)}
          </Typography>
          <TextInput label="Título" name="title" control={control} />
          <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2}>
            <CurrencyInput
              label="Valor efetivo recebido"
              name="receivedValue"
              control={control}
            />
            <DateInput label="Data" name="date" control={control} />
          </Box>
          <AutocompleteInput
            label="Banco"
            name="bankId"
            control={control}
            options={options.financeBanks ?? []}
            onInputChange={(v) => setSearch('financeBanks', v)}
          />
          <AutocompleteInput
            label="Método de Pagamento"
            name="methodId"
            control={control}
            options={options.financePaymentMethods ?? []}
            onInputChange={(v) => setSearch('financePaymentMethods', v)}
          />
          <AutocompleteInput
            label="Centro de Custo"
            name="typeId"
            control={control}
            options={options.financeTypes ?? []}
            onInputChange={(v) => setSearch('financeTypes', v)}
          />
          <TextInput
            label="Descrição"
            name="description"
            control={control}
            multiline
            minRows={2}
          />
          <TextInput
            label="Observações"
            name="observation"
            control={control}
            multiline
            minRows={2}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreate(false)} color="error">
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleCreate}
            loading={mutation.isPending}
            disabled={!selectedFinanceIds.length}
          >
            Criar Adiantamento
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={!!detailTarget}
        onClose={() => setDetailTarget(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Lançamentos — {detailTarget?.title}</DialogTitle>
        <DialogContent>
          {(detailTarget?.applications ?? []).map((app) => (
            <Box
              key={app.id}
              display="flex"
              justifyContent="space-between"
              py={1}
              borderBottom="1px solid"
              borderColor="divider"
            >
              <Box>
                <Typography variant="body2" fontWeight="medium">
                  {app.title}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {app.protocol}
                  {app.paymentDate ? ` · ${formatDate(app.paymentDate)}` : ''}
                  {` · ${app.status}`}
                </Typography>
              </Box>
              <Typography variant="body2" fontWeight="medium">
                {formatCurrency(app.value)}
              </Typography>
            </Box>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailTarget(null)}>Fechar</Button>
        </DialogActions>
      </Dialog>

      {mutation.isPending && <LinearProgress />}
    </>
  );
};
