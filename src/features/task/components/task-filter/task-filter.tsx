import {
  DateInput,
  SelectInput,
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
};

export const TaskFilter: React.FC<TaskFilterProps> = ({
  open,
  onFilter,
  loading = false,
}) => {
  const {
    control,
    fieldAccess,
    handleFilter,
    options,
    handleUpdateStatuses,
    statusFilters,
    statusOptions,
  } = useTaskFilter(onFilter);

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
              {fieldAccess.typeId && (
                <SelectInput
                  name="typeId"
                  control={control}
                  label="Tipo de OS"
                  options={options.types}
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
              {fieldAccess.clientId && (
                <SelectInput
                  name="clientId"
                  control={control}
                  label="Cliente"
                  options={options.clients}
                />
              )}
              {fieldAccess.userId && (
                <SelectInput
                  name="userId"
                  control={control}
                  label="Usuário"
                  options={options.users}
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
