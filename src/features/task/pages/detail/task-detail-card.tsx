import { Task } from '@/features/task/types';
import { taskStatusLabels } from '@/features/task/types/task';
import { formatDate } from '@/utils/date';
import { Box, Chip, Paper, Typography } from '@mui/material';

export const TaskDetailCard = ({ task }: { task: Task }) => {
  const status = task.status;
  const { label, color } =
    taskStatusLabels[status] || ({ label: status, color: 'default' } as any);

  return (
    <Paper sx={{ p: 2 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h6">{task.title}</Typography>
        <Chip label={label} variant="outlined" sx={{ borderColor: color }} />
      </Box>

      <Typography variant="subtitle2" color="text.secondary">
        Protocolo: {task.protocol}
      </Typography>
      <Typography sx={{ mt: 1 }}>{task.description}</Typography>

      <Box sx={{ mt: 2 }}>
        <Typography variant="body2">Cliente: {task.client?.name}</Typography>
        <Typography variant="body2">
          Responsável: {task.responsible?.name}
        </Typography>
        <Typography variant="body2">Tipo: {task.type?.name}</Typography>
        <Typography variant="body2">
          Data prevista: {formatDate(task.date)}
        </Typography>
        <Typography variant="body2">
          Criada em: {formatDate(task.createdAt)}
        </Typography>
      </Box>
    </Paper>
  );
};

export default TaskDetailCard;
