'use client';

import { BarChart } from '@mui/x-charts/BarChart';
import { Box, Paper, Typography } from '@mui/material';
import { ReactNode } from 'react';

type Series = {
  data: number[];
  label: string;
  color?: string;
  stack?: string;
  valueFormatter?: (value: number | null) => string;
};

type PanelChartProps = {
  title: string;
  caption?: string;
  labels: string[];
  series: Series[];
  horizontal?: boolean;
  height?: number;
  empty?: string;
};

export function PanelChart({
  title,
  caption,
  labels,
  series,
  horizontal,
  height,
  empty = 'Sem dados neste recorte.',
}: PanelChartProps) {
  const hasValue = series.some((item) => item.data.some((value) => value !== 0));
  const chartHeight = height ?? (horizontal ? Math.max(220, labels.length * 42) : 280);

  return (
    <Paper sx={{ p: 2, height: '100%' }}>
      <Typography variant="h6" color="primary" fontWeight={700}>
        {title}
      </Typography>
      {caption ? (
        <Typography variant="body2" color="text.secondary" mb={1}>
          {caption}
        </Typography>
      ) : null}
      {!labels.length || !hasValue ? (
        <Typography color="text.secondary" sx={{ py: 4 }}>
          {empty}
        </Typography>
      ) : (
        <Box sx={{ width: '100%', height: chartHeight }}>
          <BarChart
            height={chartHeight}
            layout={horizontal ? 'horizontal' : 'vertical'}
            xAxis={
              horizontal
                ? [{ min: 0 }]
                : [{ scaleType: 'band', data: labels }]
            }
            yAxis={
              horizontal
                ? [{ scaleType: 'band', data: labels, width: 140 }]
                : [{ min: 0 }]
            }
            series={series}
            hideLegend={series.length < 2}
            margin={{ left: horizontal ? 16 : 56, right: 16, top: 24, bottom: 24 }}
          />
        </Box>
      )}
    </Paper>
  );
}

export function Section({
  id,
  title,
  action,
  children,
}: {
  id: string;
  title: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <Box id={id} component="section" sx={{ scrollMarginTop: 96 }}>
      <Box display="flex" alignItems="baseline" justifyContent="space-between" gap={2} mb={2}>
        <Typography variant="h5" fontWeight={700}>
          {title}
        </Typography>
        {action}
      </Box>
      {children}
    </Box>
  );
}
