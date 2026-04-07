'use client';

import Autocomplete from '@mui/material/Autocomplete';
import CircularProgress from '@mui/material/CircularProgress';
import TextField from '@mui/material/TextField';
import { useCallback, useRef, useState } from 'react';
import { Control, Controller, FieldValues, Path } from 'react-hook-form';

export type AutocompleteOption = {
  value: string;
  label: string;
};

export type AutocompleteInputProps<T extends FieldValues> = {
  name: Path<T>;
  control: Control<T>;
  label: string;
  options: AutocompleteOption[];
  placeholder?: string;
  disabled?: boolean;
  /** External loading state (e.g. query fetching) */
  loading?: boolean;
  /** Called with the debounced input text — use to drive server search */
  onInputChange?: (value: string) => void;
};

export function AutocompleteInput<T extends FieldValues>({
  name,
  control,
  label,
  options,
  placeholder,
  disabled,
  loading,
  onInputChange,
}: AutocompleteInputProps<T>) {
  const [pending, setPending] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleInputChange = useCallback(
    (_: unknown, inputValue: string, reason: string) => {
      if (reason !== 'input') return;

      if (timerRef.current) clearTimeout(timerRef.current);

      if (onInputChange) {
        setPending(true);
        timerRef.current = setTimeout(() => {
          setPending(false);
          onInputChange(inputValue);
        }, 500);
      }
    },
    [onInputChange],
  );

  const busy = pending || loading;

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => {
        const selectedOption =
          options.find((o) => o.value === field.value) ?? null;

        return (
          <Autocomplete
            options={options}
            filterOptions={(opts) => opts}
            loading={busy}
            disabled={disabled}
            value={selectedOption}
            onChange={(_, newValue) => field.onChange(newValue?.value ?? '')}
            onInputChange={handleInputChange}
            getOptionLabel={(option) => option.label}
            isOptionEqualToValue={(option, value) =>
              option.value === value.value
            }
            noOptionsText="Nenhuma opção encontrada"
            loadingText="Carregando..."
            fullWidth
            renderInput={(params) => (
              <TextField
                {...params}
                label={label}
                placeholder={placeholder}
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
                size="small"
                slotProps={{
                  input: {
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {busy && <CircularProgress size={16} />}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  },
                }}
              />
            )}
          />
        );
      }}
    />
  );
}
