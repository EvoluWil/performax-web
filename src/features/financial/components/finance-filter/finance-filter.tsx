'use client';

import { AutocompleteInput, ButtonGroup, DateInput } from '@/components/inputs';
import { FINANCE_FILTER_FIELDS } from '@/constants/filter-permissions';
import { useFilterFieldAccess } from '@/hooks/common/use-filter-field-access';
import { yupResolver } from '@hookform/resolvers/yup';
import { Box, Button, Divider, Paper, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useFinanceBanksQuery } from '../../hooks/queries/finance-banks.query';
import { useFinanceCategoriesQuery } from '../../hooks/queries/finance-categories.query';
import { useFinancePayeesQuery } from '../../hooks/queries/finance-payees.query';
import { useFinanceSegmentsQuery } from '../../hooks/queries/finance-segments.query';
import { useFinanceTypesQuery } from '../../hooks/queries/finance-types.query';
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
  const { data: types } = useFinanceTypesQuery();
  const { data: banks } = useFinanceBanksQuery();
  const { data: categories } = useFinanceCategoriesQuery();
  const { data: segments } = useFinanceSegmentsQuery();
  const { data: payees } = useFinancePayeesQuery();

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
    // All selected = no flow restriction
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

              {fieldAccess.typeId && (
                <AutocompleteInput
                  label="Centro de Custo"
                  name="typeId"
                  control={control}
                  options={[
                    { value: '', label: 'Todos' },
                    ...(types ?? []).map((t) => ({ value: t.id, label: t.name })),
                  ]}
                />
              )}

              {fieldAccess.categoryId && (
                <AutocompleteInput
                  label="Categoria"
                  name="categoryId"
                  control={control}
                  options={[
                    { value: '', label: 'Todas' },
                    ...(categories ?? []).map((c) => ({
                      value: c.id,
                      label: c.name,
                    })),
                  ]}
                />
              )}
            </Box>
            <Box
              display="flex"
              flexDirection="column"
              gap={2}
              sx={{ minWidth: 280, flex: 1 }}
            >
              {fieldAccess.bankId && (
                <AutocompleteInput
                  label="Banco"
                  name="bankId"
                  control={control}
                  options={[
                    { value: '', label: 'Todos' },
                    ...(banks ?? []).map((b) => ({ value: b.id, label: b.name })),
                  ]}
                />
              )}

              {fieldAccess.segmentId && (
                <AutocompleteInput
                  label="Segmento"
                  name="segmentId"
                  control={control}
                  options={[
                    { value: '', label: 'Todos' },
                    ...(segments ?? []).map((s) => ({
                      value: s.id,
                      label: s.name,
                    })),
                  ]}
                />
              )}

              {fieldAccess.payeeId && (
                <AutocompleteInput
                  label="Favorecido"
                  name="payeeId"
                  control={control}
                  options={[
                    { value: '', label: 'Todos' },
                    ...(payees ?? []).map((p) => ({
                      value: p.id,
                      label: p.name,
                    })),
                  ]}
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
