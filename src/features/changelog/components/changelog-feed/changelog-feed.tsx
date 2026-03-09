'use client';

import { useChangelogQuery } from '@/features/changelog/hooks/queries/changelog.query';
import { Changelog, ChangelogType } from '@/features/changelog/types';
import { formatDate } from '@/utils/date';
import {
  BugReportOutlined,
  ExpandLessOutlined,
  ExpandMoreOutlined,
  LockOutlined,
  NewReleasesOutlined,
  StarOutlined,
  WarningAmberOutlined,
} from '@mui/icons-material';
import {
  Box,
  Chip,
  Collapse,
  Divider,
  IconButton,
  Paper,
  Skeleton,
  Typography,
} from '@mui/material';
import { useState } from 'react';

type TypeConfig = {
  label: string;
  color: 'primary' | 'error' | 'success' | 'warning' | 'secondary' | 'default';
  icon: React.ReactNode;
};

const TYPE_CONFIG: Record<ChangelogType, TypeConfig> = {
  FEATURE: {
    label: 'Nova funcionalidade',
    color: 'primary',
    icon: <StarOutlined sx={{ fontSize: 14 }} />,
  },
  FIX: {
    label: 'Correção',
    color: 'error',
    icon: <BugReportOutlined sx={{ fontSize: 14 }} />,
  },
  IMPROVEMENT: {
    label: 'Melhoria',
    color: 'success',
    icon: <NewReleasesOutlined sx={{ fontSize: 14 }} />,
  },
  BREAKING: {
    label: 'Breaking change',
    color: 'warning',
    icon: <WarningAmberOutlined sx={{ fontSize: 14 }} />,
  },
  SECURITY: {
    label: 'Segurança',
    color: 'secondary',
    icon: <LockOutlined sx={{ fontSize: 14 }} />,
  },
};

function ChangelogSkeleton() {
  return (
    <Box display="flex" flexDirection="column" gap={3} width="100%">
      {[1, 2, 3].map((i) => (
        <Box key={i} display="flex" gap={2} alignItems="flex-start">
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            pt={0.5}
          >
            <Skeleton variant="circular" width={36} height={36} />
            <Skeleton variant="rectangular" width={2} height={80} />
          </Box>
          <Box flex={1}>
            <Skeleton variant="rounded" width="100%" height={100} />
          </Box>
        </Box>
      ))}
    </Box>
  );
}

function ChangelogItem({ item, isLast }: { item: Changelog; isLast: boolean }) {
  const config = TYPE_CONFIG[item.type];
  const [expanded, setExpanded] = useState(false);

  return (
    <Box display="flex" gap={2} alignItems="flex-start">
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        flexShrink={0}
        sx={{ mt: 0.5 }}
      >
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: `${config.color}.main`,
            color: 'white',
            boxShadow: 2,
            flexShrink: 0,
          }}
        >
          {config.icon}
        </Box>
        {!isLast && (
          <Box
            sx={{
              width: 2,
              flexGrow: 1,
              minHeight: 40,
              bgcolor: 'grey.200',
              mt: 0.5,
            }}
          />
        )}
      </Box>

      <Paper
        variant="outlined"
        sx={{
          p: 2.5,
          mb: !isLast ? 2 : 0,
          flex: 1,
          borderRadius: 2,
          borderColor: 'grey.200',
          transition: 'box-shadow 0.2s',
          '&:hover': {
            boxShadow: 3,
          },
        }}
      >
        <Box
          display="flex"
          alignItems="flex-start"
          justifyContent="space-between"
          flexWrap="wrap"
          gap={1}
          mb={1}
        >
          <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
            <Chip
              label={`v${item.version}`}
              size="small"
              sx={{
                fontWeight: 700,
                bgcolor: 'primary.main',
                color: 'white',
                fontSize: 12,
              }}
            />
            <Chip
              label={config.label}
              color={config.color}
              size="small"
              variant="outlined"
              icon={config.icon as any}
              sx={{ fontWeight: 600, fontSize: 11 }}
            />
          </Box>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ mt: 0.25 }}
          >
            {formatDate(item.date)}
          </Typography>
        </Box>

        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          onClick={() => setExpanded((prev) => !prev)}
          sx={{ cursor: 'pointer', userSelect: 'none' }}
        >
          <Typography
            variant="subtitle2"
            fontWeight={700}
            color="text.primary"
            sx={{ overflow: 'visible' }}
          >
            {item.title}
          </Typography>
          <IconButton size="small" tabIndex={-1}>
            {expanded ? (
              <ExpandLessOutlined fontSize="small" />
            ) : (
              <ExpandMoreOutlined fontSize="small" />
            )}
          </IconButton>
        </Box>

        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              lineHeight: 1.6,
              whiteSpace: 'pre-line',
              overflow: 'visible',
              mt: 1,
            }}
          >
            {item.description}
          </Typography>
        </Collapse>
      </Paper>
    </Box>
  );
}

export function ChangelogFeed() {
  const { data: changelogs, isLoading } = useChangelogQuery();

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: 720,
        mx: 'auto',
        px: { xs: 2, sm: 3 },
        py: 4,
      }}
    >
      <Box mb={4}>
        <Typography
          variant="h5"
          fontWeight={700}
          color="primary.main"
          sx={{ overflow: 'visible' }}
        >
          Novidades & Atualizações
        </Typography>
        <Typography variant="body2" color="text.secondary" mt={0.5}>
          Acompanhe as últimas versões e melhorias da plataforma.
        </Typography>
        <Divider sx={{ mt: 2 }} />
      </Box>

      {isLoading && <ChangelogSkeleton />}

      {!isLoading && (!changelogs || changelogs.length === 0) && (
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          py={8}
          gap={1}
        >
          <NewReleasesOutlined sx={{ fontSize: 48, color: 'grey.300' }} />
          <Typography variant="body1" color="text.secondary">
            Nenhuma atualização disponível ainda.
          </Typography>
        </Box>
      )}

      {!isLoading && changelogs && changelogs.length > 0 && (
        <Box display="flex" flexDirection="column">
          {changelogs.map((item, index) => (
            <ChangelogItem
              key={item.id}
              item={item}
              isLast={index === changelogs.length - 1}
            />
          ))}
        </Box>
      )}
    </Box>
  );
}
