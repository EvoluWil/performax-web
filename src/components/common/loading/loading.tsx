"use client";
import Backdrop from "@mui/material/Backdrop";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import React from "react";

export type LoadingColor =
  | "primary"
  | "secondary"
  | "inherit"
  | "success"
  | "error"
  | "warning"
  | "info";

export interface LoadingProps {
  message?: string;
  fullScreen?: boolean;
  size?: number;
  thickness?: number;
  color?: LoadingColor;
}

export const Loading: React.FC<LoadingProps> = ({
  message = "Carregando conteúdo...",
  fullScreen = false,
  size = 40,
  thickness = 4,
  color = "primary",
}) => {
  if (fullScreen) {
    return (
      <Backdrop
        open
        sx={(theme) => ({
          color: theme.palette.common.white,
          zIndex: theme.zIndex.drawer + 1,
        })}
      >
        <Box display="flex" alignItems="center" flexDirection="column" gap={2}>
          <CircularProgress
            color={color as any}
            size={size}
            thickness={thickness}
          />
          {message && (
            <Typography variant="body1" color="inherit">
              {message}
            </Typography>
          )}
        </Box>
      </Backdrop>
    );
  }

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      p={8}
      gap={2}
    >
      <CircularProgress
        color={color as any}
        size={size}
        thickness={thickness}
      />
      {message && <Typography variant="body2">{message}</Typography>}
    </Box>
  );
};
