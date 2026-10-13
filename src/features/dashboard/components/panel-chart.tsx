'use client';

import { IndicatorEmpty, IndicatorTitle } from '@/features/dashboard/components/indicator';
import { BarChart } from '@mui/x-charts/BarChart';
import { CheckCircleOutline, DescriptionOutlined } from '@mui/icons-material';
import { Box, Paper, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { ReactNode } from 'react';

export function PanelSurface({
  title,
  hint,
  caption,
  children,
}: {
  title: string;
  hint?: string;
  caption?: string;
  children: ReactNode;
}) {
  const theme = useTheme();

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        height: '100%',
        borderLeft: `6px solid ${theme.palette.primary.main}`,
      }}
    >
      <IndicatorTitle title={title} hint={hint} />
      {caption ? (
        <Typography
          variant="body2"
          color="text.secondary"
          mb={1}
          sx={{ overflow: 'visible', whiteSpace: 'normal' }}
        >
          {caption}
        </Typography>
      ) : (
        <Box mb={1} />
      )}
      {children}
    </Paper>
  );
}

type Series = {
  data: number[];
  label: string;
  color?: string;
  stack?: string;
  valueFormatter?: (value: number | null) => string;
};

type PanelChartProps = {
  title: string;
  hint?: string;
  caption?: string;
  labels: string[];
  series: Series[];
  barColors?: string[];
  horizontal?: boolean;
  height?: number;
  empty?: string;
  emptyPositive?: boolean;
  integer?: boolean;
  hideZeros?: boolean;
};

function integerTick(value: number) {
  return Number.isInteger(value) ? String(value) : '';
}

export function PanelChart({
  title,
  hint,
  caption,
  labels,
  series,
  barColors,
  horizontal,
  height,
  empty = 'Sem dados neste recorte.',
  emptyPositive = false,
  integer = false,
  hideZeros = false,
}: PanelChartProps) {
  const theme = useTheme();
  const indexes = labels
    .map((_, index) => index)
    .filter((index) => !hideZeros || series.some((item) => (item.data[index] ?? 0) !== 0));
  const visibleLabels = indexes.map((index) => labels[index]);
  const visibleSeries = series.map((item) => ({
    ...item,
    data: indexes.map((index) => item.data[index] ?? 0),
  }));
  const visibleColors = barColors ? indexes.map((index) => barColors[index]) : undefined;
  const hasValue = visibleSeries.some((item) => item.data.some((value) => value !== 0));
  const stacked = visibleSeries.some((item) => item.stack);
  const showLabels = hasValue && !stacked && visibleLabels.length > 0 && visibleLabels.length <= 6;
  const chartHeight = height ?? (horizontal ? Math.max(160, visibleLabels.length * 36) : 240);
  const band = {
    scaleType: 'band' as const,
    data: visibleLabels,
    ...(horizontal ? { width: 132 } : {}),
    ...(visibleColors
      ? { colorMap: { type: 'ordinal' as const, colors: visibleColors } }
      : {}),
  };
  const valueAxis = integer
    ? [{
        min: 0,
        valueFormatter: integerTick,
        tickLabelInterval: (value: number) => Number.isInteger(value),
      }]
    : [{ min: 0 }];
  const labelFormatter = visibleSeries.find((item) => item.valueFormatter)?.valueFormatter;

  return (
    <PanelSurface title={title} hint={hint} caption={hasValue ? caption : undefined}>
      {!visibleLabels.length || !hasValue ? (
        <IndicatorEmpty
          message={empty}
          icon={
            emptyPositive ? (
              <CheckCircleOutline sx={{ color: 'success.main', fontSize: 28 }} />
            ) : (
              <DescriptionOutlined sx={{ color: 'text.secondary', fontSize: 28 }} />
            )
          }
        />
      ) : (
        <Box sx={{ width: '100%', height: chartHeight }}>
          <BarChart
            height={chartHeight}
            borderRadius={3}
            layout={horizontal ? 'horizontal' : 'vertical'}
            colors={[
              theme.palette.primary.main,
              theme.palette.secondary.main,
              theme.palette.success.main,
              theme.palette.warning.main,
              theme.palette.error.main,
            ]}
            grid={{ horizontal: !horizontal }}
            xAxis={horizontal ? valueAxis : [band]}
            yAxis={horizontal ? [band] : valueAxis}
            series={visibleSeries.map((item) => ({
              ...item,
              barLabel: showLabels
                ? (bar: { value: number | null }) => {
                    if (bar.value == null || bar.value === 0) return null;
                    return item.valueFormatter
                      ? item.valueFormatter(bar.value)
                      : labelFormatter
                        ? labelFormatter(bar.value)
                        : String(bar.value);
                  }
                : undefined,
            }))}
            hideLegend={visibleSeries.length < 2}
            margin={{ left: horizontal ? 8 : 48, right: 16, top: 16, bottom: 24 }}
            sx={{
              '& .MuiChartsAxis-tickLabel': { fill: theme.palette.text.secondary },
              '& .MuiChartsAxis-line, & .MuiChartsAxis-tick': {
                stroke: theme.palette.grey[300],
              },
              '& .MuiChartsGrid-line': { stroke: theme.palette.grey[200] },
            }}
          />
        </Box>
      )}
    </PanelSurface>
  );
}
