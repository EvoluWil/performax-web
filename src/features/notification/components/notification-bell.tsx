'use client';

import {
  AppNotification,
  NotificationDomain,
  notificationService,
} from '@/features/notification/services/notification.service';
import { companyService } from '@/services/company.service';
import { NotificationsNoneOutlined } from '@mui/icons-material';
import {
  Badge,
  Box,
  Button,
  CircularProgress,
  IconButton,
  Popover,
  Typography,
} from '@mui/material';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const HREF: Record<NotificationDomain, (id: string) => string> = {
  TASK: (id) => `/panel/tasks/${id}`,
  BUDGET: (id) => `/panel/budgets/${id}`,
  OCCURRENCE: (id) => `/panel/occurrences/${id}`,
  FINANCE: (id) => `/panel/financial/${id}`,
};

function formatWhen(value: string) {
  return new Date(value).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function NotificationBell() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [ready, setReady] = useState(false);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [extra, setExtra] = useState<AppNotification[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const open = Boolean(anchorEl);

  useEffect(() => {
    const id = companyService.getDefaultCompany()?.id ?? '';
    setCompanyId(/^[a-f\d]{24}$/i.test(id) ? id : null);
    setReady(true);
  }, []);

  const countQuery = useQuery({
    queryKey: ['notifications', companyId, 'unread'],
    enabled: ready && Boolean(companyId),
    queryFn: () => notificationService.unreadCount(),
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
  });

  const listQuery = useQuery({
    queryKey: ['notifications', companyId, 'list'],
    enabled: open && Boolean(companyId),
    queryFn: () => notificationService.list(),
  });

  useEffect(() => {
    setExtra([]);
    setNextCursor(listQuery.data?.nextCursor ?? null);
  }, [listQuery.data]);

  if (!ready) return null;

  const items = [...(listQuery.data?.data ?? []), ...extra];
  const count = countQuery.data ?? 0;

  async function refresh() {
    await queryClient.invalidateQueries({ queryKey: ['notifications', companyId] });
  }

  async function openItem(item: AppNotification) {
    if (!item.readAt) {
      await notificationService.markRead(item.id);
      await refresh();
    }
    setAnchorEl(null);
    router.push(HREF[item.domain](item.entityId));
  }

  async function markAll() {
    await notificationService.markAllRead();
    await refresh();
  }

  async function loadMore() {
    if (!nextCursor || loadingMore) return;
    setLoadingMore(true);
    try {
      const page = await notificationService.list(nextCursor);
      setExtra((current) => [...current, ...page.data]);
      setNextCursor(page.nextCursor);
    } finally {
      setLoadingMore(false);
    }
  }

  return (
    <>
      <IconButton
        color="inherit"
        aria-label={count > 0 ? `Notificações, ${count} não lidas` : 'Notificações'}
        onClick={(event) => setAnchorEl(event.currentTarget)}
      >
        <Badge color="error" badgeContent={count} invisible={count === 0} max={99}>
          <NotificationsNoneOutlined />
        </Badge>
      </IconButton>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Box width={360} maxWidth="90vw">
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            px={2}
            py={1.5}
          >
            <Typography variant="subtitle1">Notificações</Typography>
            {count > 0 && (
              <Button size="small" onClick={() => void markAll()}>
                Marcar todas como lidas
              </Button>
            )}
          </Box>
          <Box maxHeight={420} overflow="auto">
            {listQuery.isLoading ? (
              <Box display="flex" justifyContent="center" py={4}>
                <CircularProgress size={24} />
              </Box>
            ) : listQuery.isError ? (
              <Typography color="error" px={2} py={3}>
                Não foi possível carregar as notificações.
              </Typography>
            ) : items.length === 0 ? (
              <Typography color="text.secondary" px={2} py={3}>
                Nenhuma notificação.
              </Typography>
            ) : (
              items.map((item) => (
                <Box
                  key={item.id}
                  component="button"
                  type="button"
                  onClick={() => void openItem(item)}
                  width="100%"
                  textAlign="left"
                  border={0}
                  borderTop="1px solid"
                  borderColor="divider"
                  bgcolor={item.readAt ? 'transparent' : 'action.hover'}
                  px={2}
                  py={1.5}
                  sx={{ cursor: 'pointer' }}
                >
                  <Typography variant="body2" fontWeight={item.readAt ? 400 : 600}>
                    {item.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {item.body}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formatWhen(item.createdAt)}
                  </Typography>
                </Box>
              ))
            )}
          </Box>
          {nextCursor && (
            <Box display="flex" justifyContent="center" py={1}>
              <Button size="small" disabled={loadingMore} onClick={() => void loadMore()}>
                {loadingMore ? 'Carregando…' : 'Ver mais'}
              </Button>
            </Box>
          )}
        </Box>
      </Popover>
    </>
  );
}
