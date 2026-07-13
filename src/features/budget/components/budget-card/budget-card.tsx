import { formatDate } from "@/utils/date";
import DeleteOutline from "@mui/icons-material/DeleteOutline";
import EditOutlined from "@mui/icons-material/EditOutlined";
import SwapHorizOutlined from "@mui/icons-material/SwapHorizOutlined";
import {
  Box,
  Card,
  CardContent,
  Chip,
  IconButton,
  Tooltip,
  Typography,
} from "@mui/material";
import React from "react";
import {
  Budget,
  BudgetStatusEnum,
  budgetStatusLabels,
} from "../../types/budget";

type BudgetCardProps = {
  budget: Budget;
  onClick?: (budget: Budget) => void;
  onEdit?: (budget: Budget) => void;
  onDelete?: (budget: Budget) => void;
  onChangeStatus?: (budget: Budget) => void;
};

export const BudgetCard: React.FC<BudgetCardProps> = ({
  budget,
  onClick,
  onEdit,
  onDelete,
  onChangeStatus,
}) => {
  const status = budget.status as BudgetStatusEnum;
  const { label, color } = budgetStatusLabels[status] || {
    label: status,
    color: "default",
  };

  return (
    <Card
      variant="outlined"
      onClick={() => onClick?.(budget)}
      sx={{
        mb: 2,
        mx: 1,
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        minWidth: 300,
        maxWidth: 450,
        width: "100%",
        aspectRatio: "4 / 2",
        borderLeft: `6px solid ${color}`,
        overflow: "hidden",
      }}
    >
      <CardContent
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          height: "100%",
          position: "relative",
        }}
      >
        {(onEdit || onDelete || onChangeStatus) && (
          <Box
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              zIndex: 2,
              display: "flex",
              gap: 0.5,
            }}
          >
            {onChangeStatus && (
              <Tooltip title="Alterar status">
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    onChangeStatus(budget);
                  }}
                >
                  <SwapHorizOutlined fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            {onEdit && (
              <Tooltip title="Editar">
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(budget);
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
                    onDelete(budget);
                  }}
                >
                  <DeleteOutline fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        )}

        <Box>
          <Typography variant="subtitle1" fontWeight="bold" noWrap>
            {budget.title}
          </Typography>
          <Typography variant="body2" color="text.secondary" noWrap>
            {budget.client?.name} • {budget.responsible?.name}
          </Typography>
        </Box>

        <Box textAlign="right">
          <Typography variant="body2">
            {formatDate(budget.createdAt)}
          </Typography>
          <Chip
            label={label}
            sx={{ color, borderColor: color }}
            variant="outlined"
            size="small"
          />
        </Box>
      </CardContent>
    </Card>
  );
};
