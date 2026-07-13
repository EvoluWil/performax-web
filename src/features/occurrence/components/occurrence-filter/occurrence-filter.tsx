import {
  DateInput,
  SelectInput,
  TextInput,
} from '@/components/inputs';
import { StatusQuickFilter } from '@/components/common/status-quick-filter/status-quick-filter';
import { OccurrenceFilterDto } from '@/features/occurrence/schemas';
import { Box, Button, Divider, Paper, Typography } from '@mui/material';
import React from 'react';
import { useOccurrenceFilter } from './occurrence-filter.hook';

type OccurrenceFilterProps = {
  open: boolean;
  onFilter: (data: OccurrenceFilterDto) => void;
  loading?: boolean;
};

export const OccurrenceFilter: React.FC<OccurrenceFilterProps> = ({
  open,
  onFilter,
  loading = false,
}) => {
  const {
    control,
    handleFilter,
    options,
    handleUpdateStatuses,
    statusFilters,
    statusOptions,
  } = useOccurrenceFilter(onFilter);

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
            Filtros para ocorrências
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
                label="Protocolo"
                placeholder="Digite parte do protocolo"
              />

              <TextInput
                name="title"
                control={control}
                label="Título"
                placeholder="Digite parte do título"
              />
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
              <SelectInput
                name="clientId"
                control={control}
                label="Cliente"
                options={options.clients}
              />

              <SelectInput
                name="userId"
                control={control}
                label="Usuário"
                options={options.users}
              />
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
