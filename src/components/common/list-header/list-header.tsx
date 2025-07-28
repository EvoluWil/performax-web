'use client';

import { FilterAltOutlined, Refresh } from '@mui/icons-material';
import {
  AppBar,
  Box,
  Button,
  CircularProgress,
  IconButton,
  TextField,
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
};

export const ListHeader: React.FC<ListHeaderProps> = ({
  onAdd,
  onReload,
  onSearch,
  addTitle,
  searchTitle,
  onShowFilters,
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
            <TextField
              variant="filled"
              placeholder={searchTitle}
              onChange={(e) => onSearch(e.target.value)}
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
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
};
