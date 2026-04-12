'use client';

import { Loading } from '@/components/common/loading/loading';
import { DownloadOutlined, FilterListOutlined } from '@mui/icons-material';
import {
  Box,
  Button,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { BalanceFilters } from '../../components/balance-filters/balance-filters';
import { BalanceSummary } from '../../components/balance-summary/balance-summary';
import { BalanceTable } from '../../components/balance-table/balance-table';
import { generateBalanceCSV } from '../../util/balance-csv';
import { ViewMode, useFinanceBalance } from './balance.hook';

const VIEW_MODES: { value: ViewMode; label: string }[] = [
  { value: 'period', label: 'Por Período' },
  { value: 'segment', label: 'Por Segmento' },
  { value: 'category', label: 'Por Categoria' },
  { value: 'type', label: 'Por Centro de Custo' },
];

export function FinanceBalance() {
  const {
    control,
    fetchBalance,
    handleClear,
    rows,
    loading,
    totals,
    options,
    viewMode,
    setViewMode,
  } = useFinanceBalance();

  const [showFilters, setShowFilters] = useState(false);

  return (
    <Box display="flex" flexDirection="column" gap={3}>
      {loading && <Loading fullScreen message="Carregando balanço..." />}

      {/* Header */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        flexWrap="wrap"
        gap={2}
        mb={2}
      >
        <Typography variant="h5" color="primary" fontWeight="bold">
          BALANÇO FINANCEIRO
        </Typography>
        <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
          {rows.length > 0 && (
            <Button
              variant="outlined"
              onClick={() => generateBalanceCSV(rows, totals, viewMode)}
              startIcon={<DownloadOutlined />}
            >
              Exportar CSV
            </Button>
          )}
          <Button
            variant="contained"
            onClick={() => setShowFilters((v) => !v)}
            startIcon={<FilterListOutlined />}
          >
            {showFilters ? 'Esconder filtros' : 'Mostrar filtros'}
          </Button>
        </Box>
      </Box>

      {/* Collapsible Filters */}
      {showFilters && (
        <BalanceFilters
          control={control}
          options={options}
          loading={loading}
          onApply={() => fetchBalance()}
          onClear={handleClear}
        />
      )}
      {/* Summary + Table */}
      {rows.length > 0 && (
        <>
          <BalanceSummary totals={totals} />
          <Box
            display="flex"
            gap={2}
            alignItems="center"
            flexWrap="wrap"
            justifyContent="flex-end"
          >
            <ToggleButtonGroup
              exclusive
              size="small"
              value={viewMode}
              onChange={(_, v) => {
                if (v) setViewMode(v);
              }}
            >
              {VIEW_MODES.map((m) => (
                <ToggleButton key={m.value} value={m.value}>
                  {m.label}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Box>

          <BalanceTable rows={rows} viewMode={viewMode} />
        </>
      )}

      {rows.length === 0 && !loading && (
        <Box textAlign="center" py={8} color="text.disabled">
          <Typography>
            Nenhum dado para exibir. Aplique os filtros acima.
          </Typography>
        </Box>
      )}
    </Box>
  );
}
