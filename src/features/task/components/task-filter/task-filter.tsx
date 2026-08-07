import {
  AutocompleteInput,
  DateInput,
  Switch,
  TextInput,
} from '@/components/inputs';
import { StatusQuickFilter } from '@/components/common/status-quick-filter/status-quick-filter';
import { TaskFilterDto } from '@/features/task/schemas';
import { Box, Button, Divider, Paper, Typography } from '@mui/material';
import React from 'react';
import { useTaskFilter } from './task-filter.hook';

type TaskFilterProps = {
  open: boolean;
  onFilter: (data: TaskFilterDto) => void;
  loading?: boolean;
  values?: TaskFilterDto;
};

export const TaskFilter: React.FC<TaskFilterProps> = ({
  open,
  onFilter,
  loading = false,
  values,
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
  } = useTaskFilter(onFilter, values);

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
            Filtros para ordens de serviço
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
                label="Protocolo da OS"
                placeholder="Digite parte do protocolo da OS"
              />
              {fieldAccess.typeIds && (
                <AutocompleteInput
                  name="typeIds"
                  control={control}
                  label="Tipo de OS"
                  multiple
                  options={options.taskTypes ?? []}
                  loading={isLoading}
                  onInputChange={(v) => setSearch('taskTypes', v)}
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
              <DateInput
                label="Data de máxima"
                control={control}
                name="endDate"
              />
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
                  label="Usuário"
                  multiple
                  options={options.users ?? []}
                  loading={isLoading}
                  onInputChange={(v) => setSearch('users', v)}
                />
              )}
              <Switch
                name="withValue"
                control={control}
                label="Apenas OS com valor"
              />
            </Box>
          </Box>

          <Box display="flex" justifyContent="flex-end">
            <Button
              variant="outlined"
              sx={{ width: 144, mt: 3, mb: 2 }}
              onClick={handleFilter}
              disabled={loading}
              loading={loading}
            >
              Filtrar
            </Button>
          </Box>
        </Paper>
      )}
    </Box>
  );
};
