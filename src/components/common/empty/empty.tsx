import { Box, Button, Typography } from "@mui/material";
import React, { useState } from "react";

type EmptyProps = {
  message?: string;
  onReload?: () => Promise<void>;
  showReloadButton?: boolean;
};

export const Empty: React.FC<EmptyProps> = ({
  message = "Nenhum dado encontrado.",
  onReload = async () => {},
  showReloadButton = true,
}) => {
  const [loading, setLoading] = useState(false);

  const handleReload = async () => {
    setLoading(true);
    await onReload();
    setLoading(false);
  };

  return (
    <Box
      display="flex"
      justifyContent="center"
      flexDirection="column"
      alignItems="center"
      p={4}
      gap={0.5}
    >
      <Typography variant="body1" color="grey.700">
        {message}
      </Typography>
      {showReloadButton && (
        <Button
          variant="text"
          color="primary"
          loading={loading}
          onClick={handleReload}
        >
          Tentar novamente
        </Button>
      )}
    </Box>
  );
};
