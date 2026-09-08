'use client';

import { Box, TextField, Typography } from '@mui/material';
import { Control, Controller, FieldValues, Path } from 'react-hook-form';
import { ResetDefaultButton } from './ResetDefaultButton';

type ColorFieldProps<T extends FieldValues> = {
  label: string;
  name: Path<T>;
  control: Control<T>;
  defaultColor?: string;
  onReset?: () => void;
};

function isSystemColor(value: string | null | undefined, defaultColor: string) {
  return (value || '').trim().toLowerCase() === defaultColor.trim().toLowerCase();
}

export function ColorField<T extends FieldValues>({
  label,
  name,
  control,
  defaultColor = '#000000',
  onReset,
}: ColorFieldProps<T>) {
  return (
    <Box>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <>
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              mb={0.5}
              gap={1}
            >
              <Typography variant="body2" color="text.secondary">
                {label}
              </Typography>
              {onReset && (
                <ResetDefaultButton
                  onClick={onReset}
                  disabled={isSystemColor(field.value, defaultColor)}
                />
              )}
            </Box>
          <Box display="flex" alignItems="center" gap={1}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: 1,
                bgcolor: field.value || defaultColor,
                border: '1px solid',
                borderColor: 'divider',
                flexShrink: 0,
                overflow: 'hidden',
                position: 'relative',
                cursor: 'pointer',
              }}
            >
              <input
                type="color"
                value={field.value || defaultColor}
                onChange={(e) => field.onChange(e.target.value)}
                style={{
                  position: 'absolute',
                  inset: 0,
                  opacity: 0,
                  cursor: 'pointer',
                  width: '100%',
                  height: '100%',
                  border: 'none',
                  padding: 0,
                }}
              />
            </Box>
            <TextField
              size="small"
              value={field.value || ''}
              onChange={(e) => field.onChange(e.target.value)}
              placeholder={defaultColor}
              sx={{ flex: 1 }}
              inputProps={{ maxLength: 7 }}
            />
          </Box>
          </>
        )}
      />
    </Box>
  );
}
