'use client';

import { Loading } from '@/components/common/loading/loading';
import { PdfPreviewModal } from '@/components/modal';
import { usePdfGenerator } from '@/hooks/common/pdf';
import { companyService } from '@/services/company.service';
import {
  ChevronLeft,
  ChevronRight,
  DownloadOutlined,
  FilterListOutlined,
  PictureAsPdfOutlined,
} from '@mui/icons-material';
import {
  Box,
  Button,
  IconButton,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { BalanceFilters } from '../../components/balance-filters/balance-filters';
import { BalanceSummary } from '../../components/balance-summary/balance-summary';
import { BalanceTable } from '../../components/balance-table/balance-table';
import { generateBalanceCSV } from '../../util/balance-csv';
import {
  buildBalancePdfContents,
  VIEW_MODE_LABELS_PDF,
} from '../../util/balance-pdf';
import { useFinanceBalance, ViewMode } from './balance.hook';

const VIEW_MODES: { value: ViewMode; label: string }[] = [
  { value: 'period', label: 'Por Período' },
  { value: 'segment', label: 'Por Segmento' },
  { value: 'category', label: 'Por Categoria' },
  { value: 'type', label: 'Por Centro de Custo' },
  { value: 'client', label: 'Por Cliente' },
];

const MONTHS_PT = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

function firstDayISO(year: number, month: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-01`;
}

function lastDayISO(year: number, month: number): string {
  const d = new Date(year, month + 1, 0);
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

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
    setValue,
  } = useFinanceBalance();

  const [showFilters, setShowFilters] = useState(false);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [quickMonth, setQuickMonth] = useState<{
    year: number;
    month: number;
  } | null>(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });

  const handleNavigateMonth = (direction: 1 | -1) => {
    const base =
      quickMonth ??
      (() => {
        const n = new Date();
        return { year: n.getFullYear(), month: n.getMonth() };
      })();
    let newMonth = base.month + direction;
    let newYear = base.year;
    if (newMonth < 0) {
      newMonth = 11;
      newYear--;
    }
    if (newMonth > 11) {
      newMonth = 0;
      newYear++;
    }
    setQuickMonth({ year: newYear, month: newMonth });
    setValue('dateFrom', firstDayISO(newYear, newMonth));
    setValue('dateTo', lastDayISO(newYear, newMonth));
    fetchBalance();
  };

  const handleApplyCustomFilters = () => {
    setQuickMonth(null);
    fetchBalance();
  };

  const handleClearAndReset = () => {
    const now = new Date();
    setQuickMonth({ year: now.getFullYear(), month: now.getMonth() });
    handleClear();
  };

  const {
    makeDetailPDF,
    pdfModalOpen,
    pdfBlobUrl,
    pdfStorageUrl,
    pdfUploading,
    pdfTitle,
    closePdfModal,
    downloadPdf,
  } = usePdfGenerator();

  const handleDownloadPdf = async () => {
    setGeneratingPdf(true);
    try {
      const primaryColor =
        companyService.getDefaultCompany()?.whiteLabel?.primaryColor ??
        '#6B2AEE';
      const contents = buildBalancePdfContents(
        rows,
        totals,
        viewMode,
        primaryColor,
      );
      await makeDetailPDF(
        `Balanço Financeiro — ${VIEW_MODE_LABELS_PDF[viewMode]}`,
        contents,
      );
    } finally {
      setGeneratingPdf(false);
    }
  };

  return (
    <>
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
            {rows.length > 0 && (
              <Button
                variant="outlined"
                onClick={handleDownloadPdf}
                disabled={generatingPdf}
                startIcon={<PictureAsPdfOutlined />}
              >
                Exportar PDF
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
            onApply={handleApplyCustomFilters}
            onClear={handleClearAndReset}
          />
        )}

        {/* Quick month navigator + view mode toggle */}
        <Box
          display="flex"
          gap={2}
          alignItems="center"
          flexWrap="wrap"
          justifyContent="space-between"
        >
          <Box display="flex" alignItems="center" gap={0.5}>
            <IconButton size="small" onClick={() => handleNavigateMonth(-1)}>
              <ChevronLeft />
            </IconButton>
            <Typography
              variant="body2"
              fontWeight="medium"
              minWidth={130}
              textAlign="center"
            >
              {quickMonth
                ? `${MONTHS_PT[quickMonth.month]} ${quickMonth.year}`
                : 'Personalizado'}
            </Typography>
            <IconButton size="small" onClick={() => handleNavigateMonth(1)}>
              <ChevronRight />
            </IconButton>
          </Box>

          {rows.length > 0 && (
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
          )}
        </Box>

        {/* Summary + Table */}
        {rows.length > 0 && (
          <>
            <BalanceSummary totals={totals} />
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

      <PdfPreviewModal
        open={pdfModalOpen}
        onClose={closePdfModal}
        pdfBlobUrl={pdfBlobUrl}
        pdfStorageUrl={pdfStorageUrl}
        pdfUploading={pdfUploading}
        title={pdfTitle}
        onDownload={downloadPdf}
      />
    </>
  );
}
