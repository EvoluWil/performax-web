/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { ListHeader, Table } from '@/components/common';
import { CsvImportModal, useListCsvImport } from '@/components/csv-import';
import { Actions } from '@/components/common/table/table';
import {
  AutocompleteInput,
  CurrencyInput,
  DateInput,
  TextInput,
} from '@/components/inputs';
import { RecurrenceModal } from '@/components/modal';
import { useCompanyPermissions } from '@/hooks/common/permission';
import { useFormResources } from '@/hooks/use-form-resources';
import { formatDate } from '@/utils/date';
import {
  DeleteOutlined,
  EditOutlined,
  PlayArrowOutlined,
} from '@mui/icons-material';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Tooltip,
  Typography,
} from '@mui/material';
import { MRT_ColumnDef } from 'material-react-table';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { createRecurringCsvImportConfig } from '@/features/shared/config/entity-csv-import.configs';
import type { FinanceRecurringFormDto } from '../../schemas/finance-recurring-drawer.schema';
import { useForm, useWatch } from 'react-hook-form';
import { toast } from 'react-toastify';
import { rrulestr } from 'rrule';
import swal from 'sweetalert2';
import {
  useFinanceRecurringMutation,
  useFinanceRecurringsQuery,
} from '../../hooks/queries/finance-recurrings.query';
import { FinanceFlowEnum, financeFlowLabels } from '../../types/finance';
import type { FinanceRecurring } from '../../types/finance-recurring';

const WEEKDAY_LABELS: Record<string, string> = {
  MO: 'Seg',
  TU: 'Ter',
  WE: 'Qua',
  TH: 'Qui',
  FR: 'Sex',
  SA: 'Sáb',
  SU: 'Dom',
};

const FREQ_LABELS: Record<string, string> = {
  HOURLY: 'hora',
  DAILY: 'dia',
  WEEKLY: 'semana',
  MONTHLY: 'mês',
  YEARLY: 'ano',
};

function rruleToDescription(rruleStr: string): string {
  if (!rruleStr) return '—';
  try {
    const rule = rrulestr(rruleStr);
    const o = rule.origOptions as any;

    const freqKey =
      ['HOURLY', 'DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY'][o.freq] ?? '';
    const freqLabel = FREQ_LABELS[freqKey] ?? freqKey.toLowerCase();
    const interval = o.interval ?? 1;

    let text =
      interval === 1
        ? `A cada ${freqLabel}`
        : `A cada ${interval} ${freqLabel}s`;

    const days: string[] = Array.isArray(o.byweekday)
      ? o.byweekday.map(
          (w: any) => WEEKDAY_LABELS[w.toString()] ?? w.toString(),
        )
      : [];
    if (days.length) text += ` (${days.join(', ')})`;

    if (o.bymonthday) {
      const d = Array.isArray(o.bymonthday) ? o.bymonthday[0] : o.bymonthday;
      text += `, dia ${d} do mês`;
    }

    if (o.count) text += ` · ${o.count}×`;
    if (o.until)
      text += ` · até ${new Date(o.until).toLocaleDateString('pt-BR')}`;

    return text;
  } catch {
    return rruleStr;
  }
}

function nextOccurrence(rruleStr: string): string {
  if (!rruleStr) return '—';
  try {
    const rule = rrulestr(rruleStr);
    const next = rule.after(new Date());
    return next ? formatDate(next.toISOString()) : 'Encerrada';
  } catch {
    return '—';
  }
}

const columns: MRT_ColumnDef<FinanceRecurring>[] = [
  { accessorKey: 'title', header: 'Título' },
  {
    accessorKey: 'flow',
    header: 'Fluxo',
    Cell({ cell }: any) {
      const flow = cell.getValue() as FinanceFlowEnum;
      const meta = financeFlowLabels[flow] || { label: flow, color: 'default' };
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
    accessorKey: 'value',
    header: 'Valor',
    Cell({ cell }: any) {
      return Number(cell.getValue() / 100).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      });
    },
  },
  {
    accessorKey: 'recurrence',
    header: 'Recorrência',
    Cell({ cell }: any) {
      const raw = cell.getValue() as string;
      const description = rruleToDescription(raw);
      return (
        <Tooltip title={raw ?? ''} placement="top">
          <span>{description}</span>
        </Tooltip>
      );
    },
  },
  {
    accessorKey: 'lastDate',
    header: 'Última Ocorrência',
    Cell({ cell }: any) {
      return formatDate(cell.getValue());
    },
  },
  {
    id: 'nextOccurrence',
    header: 'Próxima Ocorrência',
    Cell({ row }: any) {
      return nextOccurrence(row.original.recurrence);
    },
  },
];

const flowOptions = [
  { value: FinanceFlowEnum.IN, label: 'Entrada' },
  { value: FinanceFlowEnum.OUT, label: 'Saída' },
];

type RecurringEditFormDto = {
  title: string;
  description: string;
  observation: string;
  flow: FinanceFlowEnum | '';
  value: number | string;
  date: Date | null;
  typeId: string;
  bankId: string;
  methodId: string;
  categoryId: string;
  segmentId: string;
  recurrence: string;
};

const recurringEditDefaults: RecurringEditFormDto = {
  title: '',
  description: '',
  observation: '',
  flow: '',
  value: 0,
  date: null,
  typeId: '',
  bankId: '',
  methodId: '',
  categoryId: '',
  segmentId: '',
  recurrence: '',
};

export const FinanceRecurringList = () => {
  const { data: recurrings, refetch } = useFinanceRecurringsQuery();
  const mutation = useFinanceRecurringMutation();
  const [term, setTerm] = useState('');

  const { hasPermission, isReady } = useCompanyPermissions();
  const canAdmin = isReady && hasPermission('financial', 'admin');

  const { options, setSearch } = useFormResources([
    'financeBanks',
    'financePaymentMethods',
    'financeTypes',
    'financeCategories',
    'financeSegments',
  ]);

  const [editTarget, setEditTarget] = useState<FinanceRecurring | null>(null);
  const [openRRuleModal, setOpenRRuleModal] = useState(false);

  const { control, reset, handleSubmit, setValue, getValues } =
    useForm<RecurringEditFormDto>({ defaultValues: recurringEditDefaults });

  const recurrence =
    (useWatch({ control, name: 'recurrence' }) as string) || '';
  const selectedSegmentId =
    (useWatch({ control, name: 'segmentId' }) as string) || '';

  const filteredCategories = useMemo(() => {
    const cats = options.financeCategories ?? [];
    if (!selectedSegmentId) return cats;
    return cats.filter(
      (c) => (c.data?.segmentId as string | undefined) === selectedSegmentId,
    );
  }, [options.financeCategories, selectedSegmentId]);

  useEffect(() => {
    if (!selectedSegmentId) return;
    const currentCategoryId = getValues('categoryId') as string | undefined;
    if (!currentCategoryId) return;
    const stillValid = filteredCategories.some(
      (c) => c.value === currentCategoryId,
    );
    if (!stillValid) setValue('categoryId', '');
  }, [selectedSegmentId]);

  useEffect(() => {
    if (editTarget) {
      reset({
        title: editTarget.title,
        description: editTarget.description ?? '',
        observation: editTarget.observation ?? '',
        flow: editTarget.flow ?? '',
        value: (editTarget.value ?? 0) / 100,
        date: editTarget.date ? new Date(editTarget.date) : null,
        typeId: editTarget.typeId ?? '',
        bankId: editTarget.bankId ?? '',
        methodId: editTarget.methodId ?? '',
        categoryId: editTarget.categoryId ?? '',
        segmentId: editTarget.segmentId ?? '',
        recurrence: editTarget.recurrence ?? '',
      });
    }
  }, [editTarget, reset]);

  const handleSaveEdit = handleSubmit(async (values) => {
    if (!editTarget) return;

    const { isConfirmed } = await swal.fire({
      title: 'Atualizar recorrência?',
      html: 'Ao salvar, <b>todos os lançamentos futuros pendentes e aprovados</b> vinculados a esta recorrência serão atualizados com os novos dados. Lançamentos já pagos não serão afetados.',
      icon: 'info',
      showCancelButton: true,
      confirmButtonText: 'Sim, atualizar',
      cancelButtonText: 'Cancelar',
    });

    if (!isConfirmed) return;

    try {
      const { ...saveValues } = values;
      await mutation.mutateAsync({
        type: 'update',
        id: editTarget.id,
        data: {
          ...saveValues,
          flow: saveValues.flow as FinanceFlowEnum,
          value: Math.round(Number(saveValues.value || 0) * 100),
          date: saveValues.date
            ? (saveValues.date as Date).toISOString()
            : undefined,
          typeId: saveValues.typeId || undefined,
          bankId: saveValues.bankId || undefined,
          methodId: saveValues.methodId || undefined,
          categoryId: saveValues.categoryId || undefined,
          segmentId: saveValues.segmentId || undefined,
          description: saveValues.description || undefined,
          observation: saveValues.observation || undefined,
          recurrence: saveValues.recurrence || undefined,
        } as any,
      });
      toast.success('Recorrência e lançamentos futuros atualizados');
      setEditTarget(null);
    } catch {
      toast.error('Erro ao atualizar recorrência');
    }
  });

  const handleReload = async () => {
    const { data } = await refetch();
    if (data) toast.success('Dados atualizados com sucesso');
  };

  const handleImportCreate = useCallback(
    (row: FinanceRecurringFormDto & { value: number }) =>
      mutation.mutateAsync({ type: 'create', data: row as any }),
    [mutation],
  );

  const { importOpen, setImportOpen, config: csvImportConfig } =
    useListCsvImport(createRecurringCsvImportConfig, handleImportCreate, [
      handleImportCreate,
    ]);

  const handleDelete = (id: string) => {
    swal.fire({
      title: 'Excluir recorrência?',
      html: '<b>Atenção:</b> todos os lançamentos futuros pendentes e aprovados vinculados a esta recorrência também serão excluídos permanentemente. Lançamentos já pagos não serão afetados.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d32f2f',
      confirmButtonText: 'Sim, excluir recorrência e futuros',
      cancelButtonText: 'Cancelar',
      preConfirm: async () => {
        await mutation.mutateAsync({ type: 'delete', id });
        toast.success('Recorrência e lançamentos futuros excluídos com sucesso');
      },
    });
  };

  const handleProcess = async () => {
    try {
      await mutation.mutateAsync({ type: 'process' });
      toast.success('Recorrências processadas com sucesso');
    } catch {
      toast.error('Erro ao processar recorrências');
    }
  };

  const actions: Actions<FinanceRecurring>[] = [];
  if (canAdmin) {
    actions.push({
      icon: () => <EditOutlined />,
      label: () => 'Editar',
      onClick: (r) => setEditTarget(r),
    });
    actions.push({
      icon: () => <DeleteOutlined />,
      label: () => 'Excluir',
      onClick: (r) => handleDelete(r.id),
    });
  }

  const filtered = (recurrings ?? []).filter((r) =>
    r.title?.toLowerCase().includes(term.toLowerCase()),
  );

  return (
    <>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={1}
      >
        <Typography variant="h5" color="primary" fontWeight="bold">
          LANÇAMENTOS RECORRENTES
        </Typography>
        {canAdmin && (
          <Button
            variant="outlined"
            startIcon={<PlayArrowOutlined />}
            onClick={handleProcess}
            disabled={mutation.isPending}
          >
            Processar Recorrências
          </Button>
        )}
      </Box>
      <ListHeader
        onReload={handleReload}
        onSearch={(s) => setTerm(s)}
        onImport={canAdmin ? () => setImportOpen(true) : undefined}
        searchTitle="Pesquise por título"
        addTitle=""
      />
      <Table data={filtered} columns={columns} actions={actions} />

      {/* Edit dialog */}
      <Dialog
        open={!!editTarget}
        onClose={() => setEditTarget(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Editar lançamento recorrente</DialogTitle>
        <DialogContent
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            pt: '16px !important',
          }}
        >
          <AutocompleteInput
            label="Fluxo"
            name="flow"
            control={control}
            options={flowOptions}
          />
          <TextInput label="Título" name="title" control={control} />
          <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2}>
            <CurrencyInput label="Valor" name="value" control={control} />
            <DateInput label="Data" name="date" control={control} />
          </Box>
          <AutocompleteInput
            label="Centro de Custo"
            name="typeId"
            control={control}
            options={options.financeTypes ?? []}
            onInputChange={(v) => setSearch('financeTypes', v)}
          />
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
            label="Segmento"
            name="segmentId"
            control={control}
            options={options.financeSegments ?? []}
            onInputChange={(v) => setSearch('financeSegments', v)}
          />
          <AutocompleteInput
            label="Categoria"
            name="categoryId"
            control={control}
            options={filteredCategories}
            onInputChange={(v) => setSearch('financeCategories', v)}
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
          <Box display="flex" flexDirection="column" gap={1}>
            <Button
              variant="outlined"
              size="small"
              onClick={() => setOpenRRuleModal(true)}
            >
              {recurrence ? 'Editar recorrência' : 'Definir recorrência'}
            </Button>
            {recurrence && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontStyle: 'italic' }}
              >
                {rruleToDescription(recurrence)}
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditTarget(null)} color="error">
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveEdit}
            loading={mutation.isPending}
          >
            Salvar
          </Button>
        </DialogActions>
      </Dialog>

      <RecurrenceModal
        open={openRRuleModal}
        onClose={() => setOpenRRuleModal(false)}
        initialRRule={recurrence}
        onSubmit={(rrule) => {
          setValue('recurrence', rrule);
          setOpenRRuleModal(false);
        }}
      />

      <CsvImportModal
        open={importOpen}
        onClose={() => setImportOpen(false)}
        config={csvImportConfig}
        onComplete={handleReload}
      />
    </>
  );
};
