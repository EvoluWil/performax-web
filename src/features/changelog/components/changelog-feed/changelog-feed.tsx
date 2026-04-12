'use client';

import { CHANGELOGS } from '@/features/changelog/data/changelog.data';
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
  List,
  ListItem,
  ListItemText,
  Paper,
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
          <List dense disablePadding sx={{ mt: 1 }}>
            {item.description.map((line, i) => (
              <ListItem
                key={i}
                disableGutters
                sx={{ py: 0.25, alignItems: 'flex-start' }}
              >
                <Box
                  component="span"
                  sx={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    bgcolor: 'text.disabled',
                    flexShrink: 0,
                    mt: '7px',
                    mr: 1.5,
                  }}
                />
                <ListItemText
                  primary={line}
                  slotProps={{
                    primary: {
                      variant: 'body2',
                      color: 'text.secondary',
                      sx: { lineHeight: 1.6 },
                    },
                  }}
                />
              </ListItem>
            ))}
          </List>
        </Collapse>
      </Paper>
    </Box>
  );
}

export function ChangelogFeed() {
  const changelogs = CHANGELOGS;

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

      <Box display="flex" flexDirection="column">
        {changelogs.map((item, index) => (
          <ChangelogItem
            key={item.id}
            item={item}
            isLast={index === changelogs.length - 1}
          />
        ))}
      </Box>
    </Box>
  );
}
