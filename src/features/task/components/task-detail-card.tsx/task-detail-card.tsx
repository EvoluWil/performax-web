import { FieldRow } from '@/components/common';
import { RenderFile } from '@/components/inputs';
import {
  ChecklistItemDto,
  Task,
  taskStatusLabels,
} from '@/features/task/types';
import { formatDate } from '@/utils/date';
import {
  AssignmentLateOutlined,
  CalendarTodayOutlined,
  PersonOutlined,
} from '@mui/icons-material';
import { Box, Chip, Divider, Paper, Stack, Typography } from '@mui/material';
import { Checklist } from '..';

type TaskDetailCardProps = {
  task: Task;
  onUpdateChecklistItem: (
    item: ChecklistItemDto,
    checklistId: string,
  ) => Promise<void>;
};

export const TaskDetailCard = ({
  task,
  onUpdateChecklistItem,
}: TaskDetailCardProps) => {
  const status = task.status;
  const { label, color } =
    taskStatusLabels[status] || ({ label: status, color: 'default' } as any);

  const formatCurrency = (n?: number) =>
    (n ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <Box>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' },
          gap: 3,
        }}
      >
        <Box>
          <Box>
            <Typography variant="h5" component="h2">
              {task.title}
            </Typography>
            <Typography variant="subtitle2" color="text.secondary">
              Protocolo: {task.protocol}
            </Typography>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            Descrição
          </Typography>
          <Typography px={2} variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
            {task.description || '-'}
          </Typography>

          {(!!task.impedimentNote || !!task.internalNote) && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>
                Notas
              </Typography>
              <Box px={2}>
                {task.internalNote && (
                  <FieldRow
                    props={{ flexDirection: 'column' }}
                    label="Nota Interna:"
                    value={task.internalNote || '-'}
                  />
                )}
                {task.impedimentNote && (
                  <>
                    <Divider sx={{ my: 2 }} />
                    <FieldRow
                      props={{ flexDirection: 'column' }}
                      label="Nota de Impedimento:"
                      value={task.impedimentNote || '-'}
                    />
                  </>
                )}

                {task.conclusionNote && (
                  <>
                    <Divider sx={{ my: 2 }} />
                    <FieldRow
                      props={{ flexDirection: 'column' }}
                      label="Resumo Final:"
                      value={task.conclusionNote || '-'}
                    />
                  </>
                )}
              </Box>
            </Box>
          )}

          {!!task.checklist && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>
                Checklist
              </Typography>
              <Checklist
                checklist={task.checklist}
                onSubmitItem={onUpdateChecklistItem}
              />
            </Box>
          )}

          {(task.files || []).length !== 0 && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>
                Arquivos
              </Typography>
              <Box
                display="flex"
                alignItems="center"
                mb={1}
                gap={2}
                flexWrap="wrap"
              >
                {(task.files || []).map((f: any, idx: number) => (
                  <RenderFile key={`file-${idx}`} file={f} />
                ))}
              </Box>
            </Box>
          )}
          {(task.conclusionFiles || []).length !== 0 && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>
                Arquivos de fechamento
              </Typography>
              <Box
                display="flex"
                alignItems="center"
                mb={1}
                gap={2}
                flexWrap="wrap"
              >
                {(task.conclusionFiles || []).map((f: any, idx: number) => (
                  <RenderFile key={`con-${idx}`} file={f} />
                ))}
              </Box>
            </Box>
          )}
        </Box>

        <Box>
          <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.paper' }}>
            <Stack spacing={1}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AssignmentLateOutlined color="action" />
                <Typography variant="subtitle2">Detalhes</Typography>
              </Box>
              <FieldRow
                label="Status:"
                value={
                  <Chip
                    label={label}
                    size="small"
                    variant="outlined"
                    sx={{ color, borderColor: color }}
                  />
                }
              />
              <FieldRow label="Protocolo:" value={task.protocol} />
              <FieldRow
                label="Tipo:"
                value={task.type?.name ?? task.typeId}
              />{' '}
              {task.value > 0 && (
                <FieldRow label="Valor:" value={formatCurrency(task.value)} />
              )}{' '}
              <Divider />
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PersonOutlined color="action" />
                <Typography variant="subtitle2">Envolvidos</Typography>
              </Box>
              <FieldRow
                label="Cliente:"
                value={task.client?.name ?? task.clientId}
              />
              <FieldRow
                label="Responsável:"
                value={task.responsible?.name ?? task.responsibleId}
              />
              <FieldRow
                label="Criado por:"
                value={task.createdBy?.name ?? task.createdById}
              />
              {!!task.updatedBy?.name && (
                <FieldRow
                  label="Atualizado por:"
                  value={task.updatedBy?.name}
                />
              )}
              <Divider />
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CalendarTodayOutlined color="action" />
                <Typography variant="subtitle2">Datas</Typography>
              </Box>
              <FieldRow label="Data prevista:" value={formatDate(task.date)} />
              <FieldRow label="Criada em:" value={formatDate(task.createdAt)} />
              <FieldRow
                label="Atualizada em:"
                value={formatDate(task.updatedAt)}
              />
              <FieldRow
                label="Concluída em:"
                value={task.completedAt ? formatDate(task.completedAt) : '-'}
              />
            </Stack>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};
