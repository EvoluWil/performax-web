'use client';

import { taskStatusLabels } from '@/features/task/types';
import { formatDate } from '@/utils/date';
import {
  BusinessOutlined,
  CalendarTodayOutlined,
  PersonOutlined,
} from '@mui/icons-material';
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Divider,
  Typography,
} from '@mui/material';
import { TaskWithCompany } from '../hooks/queries/attendance-tasks.query';

type TaskAttendanceCardProps = {
  task: TaskWithCompany;
  onClick: () => void;
};

export const TaskAttendanceCard = ({
  task,
  onClick,
}: TaskAttendanceCardProps) => {
  const { label, color } =
    taskStatusLabels[task.status] ||
    ({ label: task.status, color: 'default' } as any);

  return (
    <Card variant="outlined">
      <CardActionArea onClick={onClick}>
        <CardContent>
          <Box
            display="flex"
            alignItems="flex-start"
            justifyContent="space-between"
            gap={1}
            mb={1}
          >
            <Box flex={1} minWidth={0}>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                noWrap
                sx={{ fontSize: '0.72rem' }}
              >
                #{task.protocol}
              </Typography>
              <Typography variant="body1" fontWeight={600} noWrap>
                {task.title}
              </Typography>
            </Box>
            <Chip
              label={label}
              size="small"
              sx={{
                bgcolor: color,
                color: 'white',
                fontWeight: 600,
                flexShrink: 0,
              }}
            />
          </Box>

          <Divider sx={{ my: 1 }} />

          <Box display="flex" flexDirection="column" gap={0.5}>
            {task.client && (
              <Box display="flex" alignItems="center" gap={0.5}>
                <PersonOutlined fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary" noWrap>
                  {task.client.name}
                </Typography>
              </Box>
            )}
            <Box display="flex" alignItems="center" gap={0.5}>
              <CalendarTodayOutlined fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">
                {formatDate(task.date)}
              </Typography>
            </Box>
            {task.responsible && (
              <Box display="flex" alignItems="center" gap={0.5}>
                <PersonOutlined fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary" noWrap>
                  Resp.: {task.responsible.name}
                </Typography>
              </Box>
            )}
          </Box>

          <Box display="flex" justifyContent="flex-end" mt={1.5}>
            <Chip
              icon={<BusinessOutlined sx={{ fontSize: '0.8rem !important' }} />}
              label={task.companyName}
              size="small"
              variant="outlined"
              color="primary"
            />
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};
