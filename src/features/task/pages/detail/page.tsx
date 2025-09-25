'use client';
import { Box, Divider, Typography } from '@mui/material';
import { TaskDetailCard } from '../detail/task-detail-card';
import { useTaskDetail } from './detail.hook';

type Props = {
  params: { id: string };
};

const TaskDetailPage = ({ params }: Props) => {
  const { task, loading } = useTaskDetail(params.id);

  if (loading) return <Typography>Carregando...</Typography>;

  if (!task) return <Typography>Nenhuma tarefa encontrada</Typography>;

  return (
    <Box>
      <Typography variant="h5" gutterBottom color="primary" fontWeight="bold">
        Detalhe da Tarefa
      </Typography>

      <Divider sx={{ mb: 2 }} />

      <TaskDetailCard task={task} />
    </Box>
  );
};

export default TaskDetailPage;
