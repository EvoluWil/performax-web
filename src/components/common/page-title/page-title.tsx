"use client";

import ArrowBack from "@mui/icons-material/ArrowBack";
import { Box, IconButton, Stack, Typography } from "@mui/material";
import React from "react";

export type ActionButton = {
  key?: string;
  node: React.ReactNode;
  visible?: boolean;
};

export type PageTitleProps = {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  onBack?: () => void;
  actions?: ActionButton[];
};

export const PageTitle: React.FC<PageTitleProps> = ({
  title,
  subtitle,
  onBack,
  actions,
}) => {
  const visibleActions = (actions || []).filter((a) => a.visible !== false);

  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      gap={2}
    >
      <Box display="flex" alignItems="center" gap={1}>
        {onBack && (
          <IconButton
            size="small"
            onClick={onBack}
            aria-label="Voltar"
            color="primary"
            sx={{
              border: (theme) => `2px solid ${theme.palette.primary.main}`,
            }}
          >
            <ArrowBack />
          </IconButton>
        )}

        <Box>
          <Typography variant="h5" component="h1" color="primary" fontWeight="bold">
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>
      </Box>

      <Box>
        {visibleActions.length > 0 && (
          <Stack direction="row" spacing={1} alignItems="center">
            {visibleActions.map((a, idx) => (
              <React.Fragment key={a.key ?? idx}>{a.node}</React.Fragment>
            ))}
          </Stack>
        )}
      </Box>
    </Box>
  );
};

export default PageTitle;
