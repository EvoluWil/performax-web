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

export interface SwitchStyledProps extends MuiSwitchProps {
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
    <Box width="100%" display="flex" flexDirection="column">
      <Box
        display="flex"
        alignItems="center"
        gap={1}
        justifyContent="space-between"
        width="100%"
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
