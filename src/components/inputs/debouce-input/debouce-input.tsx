import { useDebounce } from '@/hooks/common/debounce';
import {
  CircularProgress,
  InputAdornment,
  OutlinedTextFieldProps,
  TextField,
} from '@mui/material';
import { JSX, useEffect, useState } from 'react';

type OutlinedTextInputPropsEdit = Omit<OutlinedTextFieldProps, 'variant'>;

interface DebounceInputStyledProps extends OutlinedTextInputPropsEdit {
  icon?: JSX.Element;
  onDebounce?: (value: string) => void;
  interval?: number;
  variant?: 'outlined' | 'standard' | 'filled';
}

export function DebounceInput({
  icon,
  onDebounce,
  disabled,
  interval = 500,
  variant = 'outlined',
  ...rest
}: DebounceInputStyledProps) {
  const initial = (rest.value ?? rest.defaultValue ?? '') as string;
  const [value, setValue] = useState<string>(String(initial || ''));
  const [isDebouncing, setIsDebouncing] = useState(false);

  const [debouncedCallback, cancel] = useDebounce((v: string) => {
    setIsDebouncing(false);
    if (onDebounce) {
      onDebounce(v);
    }
  }, interval);

  useEffect(() => {
    if (rest.value !== undefined) {
      setValue(String(rest.value ?? ''));
    }
  }, [rest.value]);

  useEffect(() => {
    return () => cancel();
  }, [cancel]);

  const handleChange = ({
    target: { value },
  }: React.ChangeEvent<HTMLInputElement>) => {
    setValue(value);
    setIsDebouncing(true);
    debouncedCallback(value);
    if (typeof rest.onChange === 'function') {
      rest.onChange({
        ...({} as any),
        target: { value },
      } as React.ChangeEvent<HTMLInputElement>);
    }
  };

  return (
    <TextField
      fullWidth
      variant={variant}
      disabled={disabled}
      sx={{
        '*': {
          zIndex: 1,
        },
      }}
      {...rest}
      value={value}
      onChange={handleChange}
      slotProps={{
        input: {
          startAdornment: icon ? (
            <InputAdornment
              position="start"
              sx={{
                color: disabled ? 'text.disabled' : 'primary.main',
              }}
            >
              {icon}
            </InputAdornment>
          ) : null,
          endAdornment: (
            <InputAdornment position="end">
              {isDebouncing && <CircularProgress color="primary" size={20} />}
            </InputAdornment>
          ),
        },
      }}
    />
  );
}
