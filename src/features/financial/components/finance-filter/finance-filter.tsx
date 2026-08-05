'use client';

import { AutocompleteInput, ButtonGroup, DateInput } from '@/components/inputs';
import { FINANCE_FILTER_FIELDS } from '@/constants/filter-permissions';
import { useFilterFieldAccess } from '@/hooks/common/use-filter-field-access';
import { useFormResources } from '@/hooks/use-form-resources';
import { ResourceKey } from '@/services/form-resources.service';
import { yupResolver } from '@hookform/resolvers/yup';
import { Box, Button, Divider, Paper, Typography } from '@mui/material';
import React, { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  FinanceFilterDto,
  financeFilterSchema,
  makeFinanceFilterInitialValues,
} from '../../schemas/finance-filter.schema';
import {
  FinanceFlowEnum,
  FinanceStatusEnum,
  financeStatusLabels,
} from '../../types/finance';

const quickFlowOptions = [
  { value: FinanceFlowEnum.IN, label: 'Entrada' },
  { value: FinanceFlowEnum.OUT, label: 'Saída' },
  { value: FinanceFlowEnum.TRANSFER, label: 'Transferência' },
];

const ALL_FLOWS = [
  FinanceFlowEnum.IN,
  FinanceFlowEnum.OUT,
  FinanceFlowEnum.TRANSFER,
];

const statusOptions = [
  { value: '', label: 'Todos' },
  ...Object.values(FinanceStatusEnum).map((v) => ({
    value: v,
    label: financeStatusLabels[v].label,
  })),
];

type FinanceFilterProps = {
  open: boolean;
  onFilter: (data: FinanceFilterDto) => void;
};

export const FinanceFilter: React.FC<FinanceFilterProps> = ({
  open,
  onFilter,
}) => {
  const fieldAccess = useFilterFieldAccess(FINANCE_FILTER_FIELDS);

  const resources = useMemo(() => {
    const keys: ResourceKey[] = [];
    if (fieldAccess.typeIds) keys.push('financeTypes');
    if (fieldAccess.bankIds) keys.push('financeBanks');
    if (fieldAccess.categoryIds) keys.push('financeCategories');
    if (fieldAccess.segmentIds) keys.push('financeSegments');
    if (fieldAccess.payeeIds) keys.push('financePayees');
    return keys;
  }, [fieldAccess]);

  const { options, setSearch, isLoading } = useFormResources(resources);

  const [quickFlow, setQuickFlow] = useState<string[]>(ALL_FLOWS);

  const { control, handleSubmit, reset } = useForm<FinanceFilterDto>({
    defaultValues: makeFinanceFilterInitialValues(),
    resolver: yupResolver(financeFilterSchema) as any,
  });

  const handleFilter = handleSubmit((values) => onFilter(values));

  const handleClear = () => {
    const initial = makeFinanceFilterInitialValues();
    reset(initial);
    setQuickFlow(ALL_FLOWS);
    onFilter({ ...initial, flows: undefined });
  };

  useEffect(() => {
    handleSubmit((values) => onFilter(values))();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleQuickFlow = (selected: string[]) => {
    setQuickFlow(selected);
    const flows = selected as FinanceFlowEnum[];
    const flowsFilter = flows.length === ALL_FLOWS.length ? undefined : flows;
    handleSubmit((values) => onFilter({ ...values, flows: flowsFilter }))();
  };

  return (
    <Box>
      <Box my={2} display="flex" alignItems="center" gap={2}>
        <ButtonGroup
          options={quickFlowOptions}
          value={quickFlow}
          onChange={(v) => handleQuickFlow(v as string[])}
          multiple
        />
      </Box>

      {open && (
        <Paper variant="outlined" sx={{ p: 2, my: 2 }}>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Filtros
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Box display="flex" flexWrap="wrap" gap={2}>
            <Box
              display="flex"
              flexDirection="column"
              gap={2}
              sx={{ minWidth: 280, flex: 1 }}
            >
              <AutocompleteInput
                label="Status"
                name="status"
                control={control}
                options={statusOptions}
              />

              {fieldAccess.typeIds && (
                <AutocompleteInput
                  label="Centro de Custo"
                  name="typeIds"
                  control={control}
                  multiple
                  options={options.financeTypes ?? []}
                  loading={isLoading}
                  onInputChange={(v) => setSearch('financeTypes', v)}
                />
              )}

              {fieldAccess.categoryIds && (
                <AutocompleteInput
                  label="Categoria"
                  name="categoryIds"
                  control={control}
                  multiple
                  options={options.financeCategories ?? []}
                  loading={isLoading}
                  onInputChange={(v) => setSearch('financeCategories', v)}
                />
              )}
            </Box>
            <Box
              display="flex"
              flexDirection="column"
              gap={2}
              sx={{ minWidth: 280, flex: 1 }}
            >
              {fieldAccess.bankIds && (
                <AutocompleteInput
                  label="Banco"
                  name="bankIds"
                  control={control}
                  multiple
                  options={options.financeBanks ?? []}
                  loading={isLoading}
                  onInputChange={(v) => setSearch('financeBanks', v)}
                />
              )}

              {fieldAccess.segmentIds && (
                <AutocompleteInput
                  label="Segmento"
                  name="segmentIds"
                  control={control}
                  multiple
                  options={options.financeSegments ?? []}
                  loading={isLoading}
                  onInputChange={(v) => setSearch('financeSegments', v)}
                />
              )}

              {fieldAccess.payeeIds && (
                <AutocompleteInput
                  label="Favorecido"
                  name="payeeIds"
                  control={control}
                  multiple
                  options={options.financePayees ?? []}
                  loading={isLoading}
                  onInputChange={(v) => setSearch('financePayees', v)}
                />
              )}
            </Box>
            <Box
              display="flex"
              flexDirection="column"
              gap={2}
              sx={{ minWidth: 280, flex: 1 }}
            >
              <DateInput
                label="Data inicial *"
                name="dateFrom"
                control={control}
              />
              <DateInput
                label="Data final *"
                name="dateTo"
                control={control}
              />
              <Box display="flex" gap={2}>
                <Button variant="outlined" onClick={handleClear} fullWidth>
                  Limpar
                </Button>
                <Button variant="contained" onClick={handleFilter} fullWidth>
                  Filtrar
                </Button>
              </Box>
            </Box>
          </Box>
        </Paper>
      )}
    </Box>
  );
};
