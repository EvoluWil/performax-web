'use client';

import { DebounceInput } from '@/components/inputs/debouce-input/debouce-input';
import {
  Dashboard,
  FilterAltOutlined,
  Refresh,
  TableRows,
} from '@mui/icons-material';
import {
  AppBar,
  Box,
  Button,
  CircularProgress,
  IconButton,
  Toolbar,
  Tooltip,
} from '@mui/material';
import React, { useState } from 'react';

type ListHeaderProps = {
  onAdd: () => void;
  onReload: () => Promise<void>;
  onSearch: (search: string) => Promise<void> | void;
  onShowFilters?: () => void;
  searchTitle: string;
  addTitle: string;
  viewMode?: 'table' | 'list';
  onToggleView?: () => void;
};

export const ListHeader: React.FC<ListHeaderProps> = ({
  onAdd,
  onReload,
  onSearch,
  addTitle,
  searchTitle,
  onShowFilters,
  viewMode,
  onToggleView,
}) => {
  const [reloading, setReloading] = useState(false);

  const handleReload = async () => {
    setReloading(true);
    await onReload();
    setReloading(false);
  };

  return (
    <AppBar
      position="static"
      color="transparent"
      elevation={0}
      sx={{ borderBottom: '1px solid rgba(0, 0, 0, 0.12)' }}
    >
      <Toolbar sx={{ p: '0 !important' }}>
        <Box display="flex" gap={2} alignItems="center" width="100%">
          <Box width="100%">
            <DebounceInput
              variant="filled"
              placeholder={searchTitle}
              onDebounce={onSearch}
              fullWidth
            />
          </Box>
          <Box
            display="flex"
            alignItems="center"
            sx={{ width: { xs: '100%', sm: 'auto' } }}
            gap={1}
          >
            <Button
              variant="contained"
              onClick={onAdd}
              sx={{
                whiteSpace: 'nowrap',
              }}
            >
              {addTitle}
            </Button>
            <Tooltip title="Atualizar">
              <IconButton onClick={handleReload}>
                {reloading && <CircularProgress color="primary" size={24} />}

                {!reloading && (
                  <Refresh color="inherit" sx={{ display: 'block' }} />
                )}
              </IconButton>
            </Tooltip>
            {!!onShowFilters && (
              <Tooltip title="Ver filtros">
                <IconButton onClick={onShowFilters}>
                  <FilterAltOutlined
                    color="inherit"
                    sx={{ display: 'block' }}
                  />
                </IconButton>
              </Tooltip>
            )}
            {onToggleView && (
              <Tooltip
                title={
                  viewMode === 'list' ? 'Ver como tabela' : 'Ver como lista'
                }
              >
                <IconButton onClick={onToggleView}>
                  {viewMode === 'list' ? <TableRows /> : <Dashboard />}
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
};
