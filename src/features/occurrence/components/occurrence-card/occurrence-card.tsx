import {
  Occurrence,
  occurrenceStatusLabels,
} from '@/features/occurrence/types';
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

type OccurrenceCardProps = {
  occurrence: Occurrence;
  onClick?: (occurrence: Occurrence) => void;
  onEdit?: (occurrence: Occurrence) => void;
  onDelete?: (occurrence: Occurrence) => void;
};

export const OccurrenceCard: React.FC<OccurrenceCardProps> = ({
  occurrence,
  onClick,
  onEdit,
  onDelete,
}) => {
  const status = occurrence.status;
  const { label, color } = occurrenceStatusLabels[status] || {
    label: status,
    color: 'default',
  };

  return (
    <Card
      variant="outlined"
      onClick={() => onClick?.(occurrence)}
      sx={{
        mb: 2,
        mx: 1,
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        minWidth: 300,
        maxWidth: 450,
        width: '100%',
        aspectRatio: '4 / 2',
        borderLeft: `6px solid ${color}`,
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
                    onEdit(occurrence);
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
                    onDelete(occurrence);
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
            {occurrence.title}
          </Typography>
          <Typography variant="body2" color="text.secondary" noWrap>
            {occurrence.client?.name || '-'} • {occurrence.type?.name || '-'}
          </Typography>
        </Box>

        <Box textAlign="right">
          <Typography variant="body2">
            {occurrence.date ? formatDate(occurrence.date) : '-'}
          </Typography>
          <Chip
            label={label}
            sx={{ color, borderColor: color }}
            size="small"
            variant="outlined"
          />
        </Box>
      </CardContent>
    </Card>
  );
};
