import {
  AutocompleteInput,
  DateInput,
  TextInput,
} from '@/components/inputs';
import { StatusQuickFilter } from '@/components/common/status-quick-filter/status-quick-filter';
import { Box, Button, Divider, Paper, Typography } from '@mui/material';
import React from 'react';
import { BudgetFilterDto } from '../../schemas/budget-filter.schema';
import { useBudgetFilter } from './budget-filter.hook';

type BudgetFilterProps = {
  open: boolean;
  onFilter: (data: BudgetFilterDto) => void;
  loading?: boolean;
};

export const BudgetFilter: React.FC<BudgetFilterProps> = ({
  open,
  onFilter,
  loading = false,
}) => {
  const {
    control,
    fieldAccess,
    handleFilter,
    options,
    setSearch,
    isLoading,
    handleUpdateStatuses,
    statusFilters,
    statusOptions,
  } = useBudgetFilter(onFilter);

  return (
    <Box>
      <Box my={2}>
        <StatusQuickFilter
          options={statusOptions}
          value={statusFilters}
          onChange={(value) => handleUpdateStatuses(value)}
        />
      </Box>
      {open && (
        <Paper variant="outlined" sx={{ p: 2, overflowX: 'auto', my: 2 }}>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Filtros para orçamentos
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <Box
            display="flex"
            flexWrap="wrap"
            gap={2}
            justifyContent="space-between"
          >
            <Box
              display="flex"
              flexDirection="column"
              gap={2}
              sx={{ minWidth: 320, flex: 1 }}
            >
              <TextInput
                name="protocol"
                control={control}
                label="Protocolo do orçamento"
                placeholder="Digite parte do protocolo do orçamento"
              />
              {fieldAccess.typeIds && (
                <AutocompleteInput
                  name="typeIds"
                  control={control}
                  label="Tipo de orçamento"
                  multiple
                  options={options.budgetTypes ?? []}
                  loading={isLoading}
                  onInputChange={(v) => setSearch('budgetTypes', v)}
                />
              )}
            </Box>

            <Box
              display="flex"
              flexDirection="column"
              gap={2}
              sx={{ minWidth: 320, flex: 1 }}
            >
              <DateInput
                label="Data mínima"
                control={control}
                name="startDate"
              />
              <DateInput label="Data máxima" control={control} name="endDate" />
            </Box>

            <Box
              display="flex"
              flexDirection="column"
              gap={2}
              sx={{ minWidth: 320, flex: 1 }}
            >
              {fieldAccess.clientIds && (
                <AutocompleteInput
                  name="clientIds"
                  control={control}
                  label="Cliente"
                  multiple
                  options={options.clients ?? []}
                  loading={isLoading}
                  onInputChange={(v) => setSearch('clients', v)}
                />
              )}
              {fieldAccess.userIds && (
                <AutocompleteInput
                  name="userIds"
                  control={control}
                  label="Responsável"
                  multiple
                  options={options.users ?? []}
                  loading={isLoading}
                  onInputChange={(v) => setSearch('users', v)}
                />
              )}
            </Box>
          </Box>

          <Box display="flex" justifyContent="flex-end">
            <Button
              variant="outlined"
              sx={{ width: 144, mt: 3, mb: 2 }}
              onClick={handleFilter}
              disabled={loading}
            >
              Filtrar
            </Button>
          </Box>
        </Paper>
      )}
    </Box>
  );
};
