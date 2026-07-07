"use client";

import { DebounceInput } from "@/components/inputs/debouce-input/debouce-input";
import {
  Dashboard,
  FilterAltOutlined,
  Refresh,
  SplitscreenOutlined,
  TableRows,
  UploadFileOutlined,
} from "@mui/icons-material";
import {
  AppBar,
  Box,
  Button,
  CircularProgress,
  IconButton,
  Toolbar,
  Tooltip,
  useMediaQuery,
} from "@mui/material";
import React, { useState } from "react";

type ListHeaderProps = {
  onAdd?: () => void;
  onImport?: () => void;
  onReload: () => Promise<void>;
  onSearch: (search: string) => Promise<void> | void;
  onShowFilters?: () => void;
  onCustomizeColumns?: () => void;
  searchTitle: string;
  addTitle: string;
  importTitle?: string;
  viewMode?: "table" | "list";
  onToggleView?: () => void;
};

export const ListHeader: React.FC<ListHeaderProps> = ({
  onAdd,
  onImport,
  onReload,
  onSearch,
  addTitle,
  importTitle = "Importar CSV",
  searchTitle,
  onShowFilters,
  viewMode,
  onToggleView,
  onCustomizeColumns,
}) => {
  const [reloading, setReloading] = useState(false);

  const isSmallScreen = useMediaQuery((theme) => theme.breakpoints.down("md"));

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
      sx={{ borderBottom: "1px solid rgba(0, 0, 0, 0.12)" }}
    >
      <Toolbar sx={{ p: "0 !important" }}>
        <Box
          display="flex"
          gap={2}
          alignItems="center"
          width="100%"
          flexDirection={{ xs: "column", md: "row" }}
          justifyContent="space-between"
        >
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
            justifyContent={{ xs: "space-between", md: "center" }}
            sx={{ width: { xs: "100%", md: "auto" } }}
            gap={1}
          >
            {onImport && (
              <Button
                variant="outlined"
                onClick={onImport}
                startIcon={<UploadFileOutlined />}
                sx={{ whiteSpace: "nowrap" }}
              >
                {importTitle}
              </Button>
            )}
            {onAdd && (
              <Button
                variant="contained"
                onClick={onAdd}
                sx={{
                  whiteSpace: "nowrap",
                }}
              >
                {addTitle}
              </Button>
            )}
            <Box display="flex" alignItems="center" gap={1}>
              <Tooltip title="Atualizar">
                <IconButton onClick={handleReload}>
                  {reloading && <CircularProgress color="primary" size={24} />}

                  {!reloading && (
                    <Refresh color="inherit" sx={{ display: "block" }} />
                  )}
                </IconButton>
              </Tooltip>
              {!!onShowFilters && (
                <Tooltip title="Ver filtros">
                  <IconButton onClick={onShowFilters}>
                    <FilterAltOutlined
                      color="inherit"
                      sx={{ display: "block" }}
                    />
                  </IconButton>
                </Tooltip>
              )}
              {onToggleView && !isSmallScreen && (
                <Tooltip
                  title={
                    viewMode === "list" ? "Ver como tabela" : "Ver como lista"
                  }
                >
                  <IconButton onClick={onToggleView}>
                    {viewMode === "list" ? <TableRows /> : <Dashboard />}
                  </IconButton>
                </Tooltip>
              )}
              {viewMode === "table" && (
                <Tooltip title="Personalizar colunas">
                  <IconButton onClick={onCustomizeColumns}>
                    <SplitscreenOutlined />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
};
