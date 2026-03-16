import { FieldRow } from '@/components/common';
import { RenderFile } from '@/components/inputs';
import {
  Occurrence,
  occurrenceStatusLabels,
} from '@/features/occurrence/types';
import { formatDate } from '@/utils/date';
import {
  AssignmentLateOutlined,
  CalendarTodayOutlined,
  PersonOutlined,
} from '@mui/icons-material';
import { Box, Chip, Divider, Paper, Stack, Typography } from '@mui/material';

type OccurrenceDetailCardProps = {
  occurrence: Occurrence;
};

export const OccurrenceDetailCard: React.FC<OccurrenceDetailCardProps> = ({
  occurrence,
}) => {
  const status = occurrence.status;
  const { label, color } = occurrenceStatusLabels[status] || {
    label: status,
    color: 'default',
  };

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
              {occurrence.title}
            </Typography>
            <Typography variant="subtitle2" color="text.secondary">
              Protocolo: {occurrence.protocol || '-'}
            </Typography>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            Descrição
          </Typography>
          <Typography px={2} variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
            {occurrence.description || '-'}
          </Typography>

          {!!occurrence.observation && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>
                Observações
              </Typography>
              <Box px={2}>
                <FieldRow
                  props={{ flexDirection: 'column' }}
                  label="Observação:"
                  value={occurrence.observation || '-'}
                />
              </Box>
            </Box>
          )}

          {(occurrence.documents || []).length !== 0 && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>
                Documentos
              </Typography>
              <Box
                display="flex"
                alignItems="center"
                mb={1}
                gap={2}
                flexWrap="wrap"
              >
                {(occurrence.documents || []).map((file, idx) => (
                  <RenderFile key={`occ-file-${idx}`} file={file} />
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
              <FieldRow label="Protocolo:" value={occurrence.protocol || '-'} />
              <FieldRow
                label="Tipo:"
                value={occurrence.type?.name ?? occurrence.typeId ?? '-'}
              />
              <Divider />
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PersonOutlined color="action" />
                <Typography variant="subtitle2">Envolvidos</Typography>
              </Box>
              <FieldRow
                label="Cliente:"
                value={occurrence.client?.name ?? occurrence.clientId ?? '-'}
              />
              <FieldRow
                label="Responsável:"
                value={
                  occurrence.responsible?.name ??
                  occurrence.responsibleId ??
                  '-'
                }
              />
              <FieldRow
                label="Criado por:"
                value={occurrence.createdBy?.name ?? occurrence.createdById}
              />
              <Divider />
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CalendarTodayOutlined color="action" />
                <Typography variant="subtitle2">Datas</Typography>
              </Box>
              <FieldRow
                label="Data da ocorrência:"
                value={occurrence.date ? formatDate(occurrence.date) : '-'}
              />
              <FieldRow
                label="Criada em:"
                value={
                  occurrence.createdAt ? formatDate(occurrence.createdAt) : '-'
                }
              />
              <FieldRow
                label="Atualizada em:"
                value={
                  occurrence.updatedAt ? formatDate(occurrence.updatedAt) : '-'
                }
              />
            </Stack>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};
