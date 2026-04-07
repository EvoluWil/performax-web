'use client';

import { ButtonGroup, DateInput, SelectInput } from '@/components/inputs';
import { Box, Button, Divider, Paper, Typography } from '@mui/material';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useFinanceBanksQuery } from '../../hooks/queries/finance-banks.query';
import { useFinanceCategoriesQuery } from '../../hooks/queries/finance-categories.query';
import { useFinancePayeesQuery } from '../../hooks/queries/finance-payees.query';
import { useFinanceSegmentsQuery } from '../../hooks/queries/finance-segments.query';
import { useFinanceTypesQuery } from '../../hooks/queries/finance-types.query';
import {
  FinanceFilterDto,
  financeFilterInitialValues,
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
  const { data: types } = useFinanceTypesQuery();
  const { data: banks } = useFinanceBanksQuery();
  const { data: categories } = useFinanceCategoriesQuery();
  const { data: segments } = useFinanceSegmentsQuery();
  const { data: payees } = useFinancePayeesQuery();

  const [quickFlow, setQuickFlow] = useState<string[]>(ALL_FLOWS);

  const { control, handleSubmit, reset } = useForm<FinanceFilterDto>({
    defaultValues: financeFilterInitialValues,
  });

  const handleFilter = handleSubmit((values) => onFilter(values));

  const handleClear = () => {
    reset(financeFilterInitialValues);
    setQuickFlow(ALL_FLOWS);
    onFilter({ ...financeFilterInitialValues, flows: undefined });
  };

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
              <SelectInput
                label="Status"
                name="status"
                control={control}
                options={statusOptions}
              />
              <SelectInput
                label="Centro de Custo"
                name="typeId"
                control={control}
                options={[
                  { value: '', label: 'Todos' },
                  ...(types ?? []).map((t) => ({ value: t.id, label: t.name })),
                ]}
              />
              <SelectInput
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
            </Box>
            <Box
              display="flex"
              flexDirection="column"
              gap={2}
              sx={{ minWidth: 280, flex: 1 }}
            >
              <SelectInput
                label="Banco"
                name="bankId"
                control={control}
                options={[
                  { value: '', label: 'Todos' },
                  ...(banks ?? []).map((b) => ({ value: b.id, label: b.name })),
                ]}
              />
              <SelectInput
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
              <SelectInput
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
            </Box>
            <Box
              display="flex"
              flexDirection="column"
              gap={2}
              sx={{ minWidth: 280, flex: 1 }}
            >
              <DateInput
                label="Data inicial"
                name="dateFrom"
                control={control}
              />
              <DateInput label="Data final" name="dateTo" control={control} />
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
