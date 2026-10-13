'use client';

import { StatusChip } from '@/features/dashboard/components/status-chip';
import {
  detailPath,
  formatDay,
  formatStoredMoney,
} from '@/features/dashboard/pages/format';
import { DashboardPriority } from '@/features/dashboard/types/dashboard';
import { Box, Button, Card, CardContent, Typography } from '@mui/material';
import Link from 'next/link';

function severityColor(severity: DashboardPriority['severity']) {
  return severity === 'high' ? 'error.main' : 'warning.main';
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
    <Box display="flex" flexDirection="column" gap={2}>
      {items.map((priority) => {
        const color = severityColor(priority.severity);
        return (
          <Box key={priority.id}>
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              gap={2}
              flexWrap="wrap"
              mb={1}
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
              >
                Ver lista ({priority.count})
              </Button>
            </Box>
            <Typography variant="body2" color="text.secondary" mb={1}>
              {formatStoredMoney(priority.value, priority.money)} no total
            </Typography>
            <Box display="flex" flexDirection="column" gap={1}>
              {priority.items.map((item) => (
                <Card
                  key={item.id}
                  variant="outlined"
                  component={Link}
                  href={detailPath(priority.id, item.id)}
                  sx={{
                    textDecoration: 'none',
                    color: 'inherit',
                    borderLeftWidth: 6,
                    borderLeftStyle: 'solid',
                    borderLeftColor: color,
                  }}
                >
                  <CardContent
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      gap: 2,
                      py: 1.5,
                      '&:last-child': { pb: 1.5 },
                    }}
                  >
                    <Box minWidth={0}>
                      <Typography variant="subtitle1" fontWeight="bold" noWrap>
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
                  </CardContent>
                </Card>
              ))}
            </Box>
          </Box>
        );
      })}
    </Box>
  );
}
