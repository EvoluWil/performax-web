'use client';

import { PageTitle } from '@/components/common';
import { StatusQuickFilter } from '@/components/common/status-quick-filter/status-quick-filter';
import { Loading } from '@/components/common/loading/loading';
import { useCompanyPermissions } from '@/hooks/common/permission';
import {
  ChevronLeft,
  ChevronRight,
  FilterAltOff,
  SupportAgent,
} from '@mui/icons-material';
import {
  Box,
  Button,
  Chip,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useRouter } from 'next/navigation';
import { TaskAttendanceCard } from '../../components/TaskAttendanceCard';
import {
  ATTENDANCE_STATUS_OPTIONS,
  useAttendanceList,
} from './list.hook';

export const AttendanceList = () => {
  const {
    tasks,
    isLoading,
    search,
    setSearch,
    selectedStatuses,
    toggleStatuses,
    companyIds,
    setCompanyFilter,
    shiftDate,
    dateLte,
    clearFilters,
    isFiltered,
    availableCompanies,
  } = useAttendanceList();

  const { hasPermission, isReady: permissionsReady } = useCompanyPermissions();
  const canWrite = permissionsReady && hasPermission('task', 'write');

  const { push } = useRouter();

  const handleCardClick = (companyId: string, taskId: string) => {
    push(`/panel/attendance/${companyId}/${taskId}`);
  };

  const dateLteLabel = format(dateLte, "dd 'de' MMM yyyy", { locale: ptBR });

  return (
    <Box display="flex" flexDirection="column" gap={3}>
      <PageTitle
        title="Atendimento"
        subtitle="Acompanhe e gerencie as ordens de serviço de todas as suas empresas"
      />

      {!permissionsReady ? (
        <Loading />
      ) : !canWrite ? (
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          py={8}
          color="text.secondary"
          gap={1}
        >
          <SupportAgent sx={{ fontSize: 56, opacity: 0.25 }} />
          <Typography variant="body1">
            Você não tem permissão para acessar o atendimento.
          </Typography>
        </Box>
      ) : (
        <>
      <Box my={1}>
        <StatusQuickFilter
          options={ATTENDANCE_STATUS_OPTIONS}
          value={selectedStatuses}
          onChange={toggleStatuses}
        />
      </Box>

      {/* Secondary filters */}
      <Box display="flex" flexWrap="wrap" gap={2} alignItems="center">
        <TextField
          label="Buscar"
          size="small"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Protocolo, título ou cliente..."
          sx={{ minWidth: 220 }}
        />

        {availableCompanies.length > 1 && (
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Empresa</InputLabel>
            <Select
              multiple
              value={companyIds}
              onChange={(e) =>
                setCompanyFilter(
                  typeof e.target.value === 'string'
                    ? e.target.value.split(',')
                    : (e.target.value as string[]),
                )
              }
              input={<OutlinedInput label="Empresa" />}
              renderValue={(selected) =>
                (selected as string[])
                  .map(
                    (id) =>
                      availableCompanies.find((c) => c.id === id)?.name ?? id,
                  )
                  .join(', ')
              }
            >
              {availableCompanies.map((c) => (
                <MenuItem key={c.id} value={c.id}>
                  {c.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        {/* Date stepper */}
        <Box display="flex" alignItems="center" gap={0.5}>
          <Tooltip title="Dia anterior">
            <IconButton size="small" onClick={() => shiftDate(-1)}>
              <ChevronLeft fontSize="small" />
            </IconButton>
          </Tooltip>
          <Typography
            variant="body2"
            sx={{ minWidth: 120, textAlign: 'center' }}
          >
            até {dateLteLabel}
          </Typography>
          <Tooltip title="Próximo dia">
            <IconButton size="small" onClick={() => shiftDate(1)}>
              <ChevronRight fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>

        {isFiltered && (
          <Tooltip title="Limpar filtros">
            <Button
              size="small"
              variant="outlined"
              color="inherit"
              startIcon={<FilterAltOff fontSize="small" />}
              onClick={clearFilters}
            >
              Limpar
            </Button>
          </Tooltip>
        )}
      </Box>

      {/* Results */}
      {isLoading ? (
        <Loading />
      ) : tasks.length === 0 ? (
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          py={8}
          color="text.secondary"
          gap={1}
        >
          <SupportAgent sx={{ fontSize: 56, opacity: 0.25 }} />
          <Typography variant="body1">Nenhuma OS encontrada</Typography>
        </Box>
      ) : (
        <>
          <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="body2" color="text.secondary">
              {tasks.length} OS
            </Typography>
            {isFiltered && (
              <Chip
                label="Filtros ativos"
                size="small"
                variant="outlined"
                color="primary"
              />
            )}
          </Box>
          <Grid container spacing={2}>
            {tasks.map((task) => (
              <Grid key={task.id} size={{ xs: 12, sm: 6, md: 4 }}>
                <TaskAttendanceCard
                  task={task}
                  onClick={() => handleCardClick(task.companyId, task.id)}
                />
              </Grid>
            ))}
          </Grid>
        </>
      )}
        </>
      )}
    </Box>
  );
};
