import { Box, BoxProps, Typography } from "@mui/material";

export const FieldRow = ({
  label,
  value,
  props,
}: {
  label: string;
  value?: React.ReactNode;
  props?: BoxProps;
}) => (
  <Box
    {...props}
    sx={{ display: "flex", gap: 1, alignItems: "flex-start", mb: 1 }}
  >
    <Typography variant="caption" color="text.secondary" sx={{ minWidth: 110 }}>
      {label}
    </Typography>
    {typeof value === "string" || typeof value === "number" ? (
      <Typography variant="body2">{value ?? "-"}</Typography>
    ) : (
      value || <Typography variant="body2">-</Typography>
    )}
  </Box>
);
