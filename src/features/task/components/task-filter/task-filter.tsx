import { DateInput, SelectInput, Switch, TextInput } from '@/components/inputs';
import { Box, Button, Divider, Paper, Typography } from '@mui/material';
import React from 'react';
import { useTaskFilter } from './task-filter.hook';

type TaskFilterProps = {
  open: boolean;
  onFilter: (data: any) => void;
  loading?: boolean;
};

export const TaskFilter: React.FC<TaskFilterProps> = ({
  open,
  onFilter,
  loading = false,
}) => {
  const { control, hasUserFilter, handleFilter, options } =
    useTaskFilter(onFilter);

  if (!open) return null;

  return (
    <Paper variant="outlined" sx={{ p: 2, overflowX: 'auto', my: 2 }}>
      <Typography variant="h6" fontWeight={600} gutterBottom>
        Filtros para tarefas
      </Typography>
      <Divider sx={{ mb: 2 }} />

      <Box display="flex" flexWrap="wrap" gap={4} mb={2} alignItems="center">
        <Switch name="open" control={control} label="Abertas" defaultValue />
        <Switch
          name="expired"
          control={control}
          label="Em atraso"
          defaultValue
        />
        <Switch
          name="emergency"
          control={control}
          label="Emergência"
          defaultValue
        />
        <Switch
          name="scheduled"
          control={control}
          label="Agendadas"
          defaultValue
        />
        <Switch
          name="impeded"
          control={control}
          label="Impedidas"
          defaultValue
        />
        <Switch
          name="in_progress"
          control={control}
          label="Em andamento"
          defaultValue
        />
        <Switch name="closed" control={control} label="Finalizadas" />
      </Box>

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
            label="Protocolo da tarefa"
            placeholder="Digite parte do protocolo da tarefa"
          />
          <SelectInput
            name="typeId"
            control={control}
            label="Tipo de tarefa"
            options={options.types}
          />
        </Box>

        <Box
          display="flex"
          flexDirection="column"
          gap={2}
          sx={{ minWidth: 320, flex: 1 }}
        >
          <DateInput label="Data mínima" control={control} name="startDate" />
          <DateInput label="Data de máxima" control={control} name="endDate" />
        </Box>

        <Box
          display="flex"
          flexDirection="column"
          gap={2}
          sx={{ minWidth: 320, flex: 1 }}
        >
          <SelectInput
            name="clientId"
            control={control}
            label="Cliente"
            options={options.clients}
          />
          {hasUserFilter && (
            <SelectInput
              name="userId"
              control={control}
              label="Usuário"
              options={options.users}
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
  );
};
