import {
  InputAdornment,
  OutlinedTextFieldProps,
  TextField,
} from '@mui/material';
import { JSX } from 'react';
import {
  FieldValues,
  UseControllerProps,
  useController,
} from 'react-hook-form';

type OutlinedTextInputPropsEdit = Omit<OutlinedTextFieldProps, 'variant'>;

export interface TextInputStyledProps extends OutlinedTextInputPropsEdit {
  icon?: JSX.Element;
  onCallback?: (value: string) => void;
  variant?: 'outlined' | 'standard' | 'filled';
}

export type TextInputProps<T extends FieldValues> = TextInputStyledProps &
  UseControllerProps<T>;

export function TextInput<T extends FieldValues>({
  name,
  icon,
  control,
  defaultValue,
  rules,
  shouldUnregister,
  disabled,
  onCallback,
  select = false,
  variant = 'outlined',
  ...rest
}: TextInputProps<T>) {
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
    <TextField
      fullWidth
      variant={variant}
      select={select}
      helperText={error?.message}
      error={!!error?.message}
      disabled={disabled || isSubmitting}
      required={!!rules?.required}
      sx={{
        '*': {
          zIndex: 1,
        },
      }}
      {...rest}
      {...field}
      onChange={(e) => {
        field.onChange(e);
        if (onCallback) {
          onCallback(e.target.value);
        }
      }}
      slotProps={{
        input: {
          startAdornment: icon ? (
            <InputAdornment
              position="start"
              sx={
                select && !field.value
                  ? {
                      position: 'relative',
                      '&:after': {
                        content: `"${rest?.placeholder}"`,
                        position: 'absolute',
                        top: select ? 0 : -12,
                        left: 32,
                      },
                    }
                  : {
                      color: disabled ? 'text.disabled' : 'primary.main',
                    }
              }
            >
              {icon}
            </InputAdornment>
          ) : null,
        },
      }}
    />
  );
}
