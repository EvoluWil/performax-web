import {
  Box,
  Switch as MuiSwitch,
  SwitchProps as MuiSwitchProps,
  Typography,
} from '@mui/material';
import {
  FieldValues,
  UseControllerProps,
  useController,
} from 'react-hook-form';

export interface SwitchStyledProps
  extends Omit<MuiSwitchProps, 'defaultValue' | 'checked' | 'onChange'> {
  label: string;
}

export type SwitchProps<T extends FieldValues> = SwitchStyledProps &
  UseControllerProps<T>;

export function Switch<T extends FieldValues>({
  name,
  control,
  defaultValue,
  rules,
  shouldUnregister,
  disabled,
  label,
  ...rest
}: SwitchProps<T>) {
  const {
    field,
    fieldState: { error },
    formState: { isSubmitting },
  } = useController({
    name,
    control,
    defaultValue,
    rules,
    shouldUnregister,
  });

  return (
    <Box
      display="flex"
      flexDirection="column"
      border="1px solid"
      borderColor={error ? 'error.main' : 'divider'}
      borderRadius={2}
      pl={1}
    >
      <Box
        display="flex"
        alignItems="center"
        gap={1}
        justifyContent="space-between"
        width={200}
      >
        <Typography variant="body2" color={error ? 'error' : 'textSecondary'}>
          {label}
        </Typography>
        <MuiSwitch
          {...rest}
          checked={!!field.value}
          onChange={(e) => field.onChange(e.target.checked)}
          disabled={disabled || isSubmitting}
        />
      </Box>
      {error && (
        <Typography variant="caption" color="error">
          {error.message}
        </Typography>
      )}
    </Box>
  );
}
