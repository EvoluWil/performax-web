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
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import swal from 'sweetalert2';
import {
  useFinanceAdvanceMutation,
  useFinanceAdvancesQuery,
} from '../../hooks/queries/finance-advances.query';
import {
  AdvanceStatusEnum,
  FinanceAdvance,
  advanceStatusLabels,
} from '../../types/finance-advance';

type CreateAdvanceFormDto = {
  title: string;
  description: string;
  observation: string;
  value: number | string;
  date: Date | null;
  bankId: string;
  methodId: string;
  typeId: string;
};

const createDefaults: CreateAdvanceFormDto = {
  title: '',
  description: '',
  observation: '',
  value: 0,
  date: new Date(),
  bankId: '',
  methodId: '',
  typeId: '',
};

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
    header: 'Valor Total',
    Cell({ cell }: any) {
      return formatCurrency(cell.getValue());
    },
  },
  {
    accessorKey: 'remainingValue',
    header: 'Saldo Disponível',
    Cell({ cell }: any) {
      return formatCurrency(cell.getValue());
    },
  },
  {
    id: 'usedValue',
    header: 'Utilizado',
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

  const { control, handleSubmit, reset } = useForm<CreateAdvanceFormDto>({
    defaultValues: createDefaults,
  });

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
    try {
      await mutation.mutateAsync({
        type: 'create',
        data: {
          title: values.title,
          description: values.description || undefined,
          observation: values.observation || undefined,
          totalValue: Math.round(Number(values.value || 0) * 100),
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
      text: 'O valor será removido do saldo da empresa.',
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
      condition: (a) => (a.applications?.length ?? 0) === 0,
    });
  }

  return (
    <>
      <Box mb={1}>
        <Typography variant="h5" color="primary" fontWeight="bold">
          ADIANTAMENTOS
        </Typography>
        <Typography variant="body2" color="text.secondary" mt={0.5}>
          Antecipações que entram no saldo da empresa e podem ser aplicadas em
          lançamentos pagos.
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
        maxWidth="sm"
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
            O valor informado entrará imediatamente no saldo da empresa.
          </Typography>
          <TextInput label="Título" name="title" control={control} />
          <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2}>
            <CurrencyInput label="Valor" name="value" control={control} />
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
        <DialogTitle>
          Lançamentos — {detailTarget?.title}
        </DialogTitle>
        <DialogContent>
          {(detailTarget?.applications ?? []).map((app) => {
            const net =
              app.flow === 'IN'
                ? app.value - app.tax - app.retention
                : app.value + app.tax + app.retention;
            return (
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
                    {app.paymentDate
                      ? ` · ${formatDate(app.paymentDate)}`
                      : ''}
                  </Typography>
                </Box>
                <Typography variant="body2" fontWeight="medium">
                  {formatCurrency(net)}
                </Typography>
              </Box>
            );
          })}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailTarget(null)}>Fechar</Button>
        </DialogActions>
      </Dialog>

      {mutation.isPending && <LinearProgress />}
    </>
  );
};
