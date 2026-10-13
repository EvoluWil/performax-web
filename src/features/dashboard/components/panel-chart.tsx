'use client';

import { Empty } from '@/components/common';
import { BarChart } from '@mui/x-charts/BarChart';
import { Box, Paper, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { ReactNode } from 'react';

export function PanelSurface({
  title,
  caption,
  children,
}: {
  title: string;
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
      <Typography variant="subtitle1" color="primary" fontWeight="bold">
        {title}
      </Typography>
      {caption ? (
        <Typography variant="body2" color="text.secondary" mb={1}>
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
  caption?: string;
  labels: string[];
  series: Series[];
  barColors?: string[];
  horizontal?: boolean;
  height?: number;
  empty?: string;
};

export function PanelChart({
  title,
  caption,
  labels,
  series,
  barColors,
  horizontal,
  height,
  empty = 'Sem dados neste recorte.',
}: PanelChartProps) {
  const theme = useTheme();
  const hasValue = series.some((item) => item.data.some((value) => value !== 0));
  const chartHeight = height ?? (horizontal ? Math.max(220, labels.length * 42) : 280);
  const band = {
    scaleType: 'band' as const,
    data: labels,
    ...(horizontal ? { width: 148 } : {}),
    ...(barColors
      ? { colorMap: { type: 'ordinal' as const, colors: barColors } }
      : {}),
  };

  return (
    <PanelSurface title={title} caption={caption}>
      {!labels.length || !hasValue ? (
        <Empty message={empty} showReloadButton={false} />
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
            xAxis={horizontal ? [{ min: 0 }] : [band]}
            yAxis={horizontal ? [band] : [{ min: 0 }]}
            series={series}
            hideLegend={series.length < 2}
            margin={{ left: horizontal ? 8 : 56, right: 16, top: 16, bottom: 24 }}
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
