'use client';

import {
  detailPath,
  formatDay,
  formatStoredMoney,
} from '@/features/dashboard/pages/format';
import { DashboardPriority } from '@/features/dashboard/types/dashboard';
import { StatusChip } from '@/features/dashboard/components/status-chip';
import { ChevronRight } from '@mui/icons-material';
import { Box, Button, Divider, Paper, Typography } from '@mui/material';
import Link from 'next/link';

function severityColor(severity: DashboardPriority['severity']) {
  return severity === 'high' ? 'error.main' : 'warning.main';
}

function recordLabel(id: DashboardPriority['id'], count: number) {
  if (id === 'overdue-receivables') return count === 1 ? 'lançamento' : 'lançamentos';
  if (id === 'budgets-awaiting') return count === 1 ? 'proposta' : 'propostas';
  return 'OS';
}

export function PriorityList({ items }: { items: DashboardPriority[] }) {
  if (!items.length) {
    return (
      <Typography variant="body2" color="text.secondary">
        Nada urgente neste recorte.
      </Typography>
    );
  }

  return (
    <Box display="grid" gridTemplateColumns={{ xs: '1fr', md: '1fr 1fr' }} gap={2}>
      {items.map((priority) => {
        const color = severityColor(priority.severity);
        return (
          <Paper
            key={priority.id}
            variant="outlined"
            sx={{
              p: 2,
              borderLeftWidth: 6,
              borderLeftStyle: 'solid',
              borderLeftColor: color,
            }}
          >
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              gap={1}
              flexWrap="wrap"
            >
              <Box display="flex" alignItems="center" gap={1} minWidth={0}>
                <StatusChip
                  label={priority.severity === 'high' ? 'Alta' : 'Média'}
                  color={color}
                />
                <Typography variant="subtitle1" fontWeight="bold" noWrap>
                  {priority.label}
                </Typography>
              </Box>
              <Button
                component={Link}
                href={priority.href}
                size="small"
                variant="text"
                endIcon={<ChevronRight />}
              >
                Ver todos ({priority.count})
              </Button>
            </Box>
            <Typography variant="body2" color="text.secondary" mt={0.5}>
              {formatStoredMoney(priority.value, priority.money)} no total · {priority.count}{' '}
              {recordLabel(priority.id, priority.count)}
            </Typography>
            <Divider sx={{ my: 1 }} />
            {priority.items.map((item, index) => (
              <Box key={item.id}>
                {index > 0 ? <Divider /> : null}
                <Box
                  component={Link}
                  href={detailPath(priority.id, item.id)}
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  gap={2}
                  py={1}
                  sx={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <Box minWidth={0}>
                    <Typography variant="body2" fontWeight="bold" noWrap>
                      {item.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {item.protocol}
                      {item.clientName ? ` • ${item.clientName}` : ''}
                    </Typography>
                  </Box>
                  <Box textAlign="right" flexShrink={0}>
                    <Typography variant="body2" color="primary" fontWeight="bold">
                      {formatStoredMoney(item.value, priority.money)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {formatDay(item.date)}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            ))}
          </Paper>
        );
      })}
    </Box>
  );
}
