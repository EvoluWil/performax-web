'use client';

import { formatDate } from '@/utils/date';
import DeleteOutline from '@mui/icons-material/DeleteOutline';
import EditOutlined from '@mui/icons-material/EditOutlined';
import {
  Box,
  Card,
  CardContent,
  Chip,
  IconButton,
  Tooltip,
  Typography,
} from '@mui/material';
import React from 'react';
import {
  Finance,
  FinanceFlowEnum,
  FinanceStatusEnum,
  financeFlowLabels,
  financeStatusLabels,
} from '../../types/finance';

type FinanceCardProps = {
  finance: Finance;
  onClick?: (finance: Finance) => void;
  onEdit?: (finance: Finance) => void;
  onDelete?: (finance: Finance) => void;
};

export const FinanceCard: React.FC<FinanceCardProps> = ({
  finance,
  onClick,
  onEdit,
  onDelete,
}) => {
  const status = finance.status as FinanceStatusEnum;
  const flow = finance.flow as FinanceFlowEnum;
  const statusMeta = financeStatusLabels[status] || {
    label: status,
    color: 'default',
  };
  const flowMeta = financeFlowLabels[flow] || { label: flow, color: 'default' };

  const borderColor =
    flow === FinanceFlowEnum.IN
      ? '#2e7d32'
      : flow === FinanceFlowEnum.OUT
        ? '#c62828'
        : '#1565c0';

  return (
    <Card
      variant="outlined"
      onClick={() => onClick?.(finance)}
      sx={{
        mb: 2,
        mx: 1,
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        minWidth: 300,
        maxWidth: 450,
        width: '100%',
        borderLeft: `6px solid ${borderColor}`,
        overflow: 'hidden',
      }}
    >
      <CardContent
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          height: '100%',
          position: 'relative',
        }}
      >
        {(onEdit || onDelete) && (
          <Box
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              zIndex: 2,
              display: 'flex',
              gap: 0.5,
            }}
          >
            {onEdit && (
              <Tooltip title="Editar">
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(finance);
                  }}
                >
                  <EditOutlined fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            {onDelete && (
              <Tooltip title="Excluir">
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(finance);
                  }}
                >
                  <DeleteOutline fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        )}

        <Box>
          <Typography variant="caption" color="text.secondary">
            {finance.protocol}
          </Typography>
          <Typography variant="subtitle1" fontWeight="bold" noWrap>
            {finance.title}
          </Typography>
          <Typography variant="h6" fontWeight="bold" color={borderColor}>
            {Number(finance.value / 100).toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            })}
          </Typography>
        </Box>

        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mt={1}
        >
          <Box display="flex" gap={1}>
            <Chip
              label={flowMeta.label}
              size="small"
              sx={{ color: flowMeta.color, borderColor: flowMeta.color }}
              variant="outlined"
            />
            {finance.approved === false ? (
              <Chip
                label="Aguardando aprovação"
                size="small"
                sx={{ color: 'warning.main', borderColor: 'warning.main' }}
                variant="outlined"
              />
            ) : (
              <Chip
                label={statusMeta.label}
                size="small"
                sx={{ color: statusMeta.color, borderColor: statusMeta.color }}
                variant="outlined"
              />
            )}
          </Box>
          <Typography variant="caption" color="text.secondary">
            {formatDate(finance.date)}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};
