import { Task, taskStatusLabels } from "@/features/task/types";
import { formatDate } from "@/utils/date";
import DeleteOutline from "@mui/icons-material/DeleteOutline";
import EditOutlined from "@mui/icons-material/EditOutlined";
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

type TaskCardProps = {
  task: Task;
  onClick?: (task: Task) => void;
  onEdit?: (task: Task) => void;
  onDelete?: (task: Task) => void;
};

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onClick,
  onEdit,
  onDelete,
}) => {
  const status = task.status;
  const { label, color } = taskStatusLabels[status] || {
    label: status,
    color: "default",
  };

  return (
    <Card
      variant="outlined"
      onClick={() => onClick?.(task)}
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
          <Tooltip title="Editar">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                if (onEdit) {
                  onEdit(task);
                }
              }}
            >
              <EditOutlined fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Excluir">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                if (onDelete) {
                  onDelete(task);
                }
              }}
            >
              <DeleteOutline fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>

        <Box>
          <Typography
            variant="subtitle1"
            fontWeight="bold"
            noWrap
            maxWidth="calc(100% - 56px)"
          >
            {task.title}
          </Typography>
          <Typography variant="body2" color="text.secondary" noWrap>
            {task.client?.name} • {task.responsible?.name}
          </Typography>
        </Box>

        <Box textAlign="right">
          <Typography variant="body2">{formatDate(task.date)}</Typography>
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
