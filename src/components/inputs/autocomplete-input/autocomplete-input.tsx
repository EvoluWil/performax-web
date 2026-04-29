'use client';

import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import { useCallback, useEffect, useRef, useState } from 'react';
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
  createLabel?: string;
  enableCreate?: boolean;
  onCreate?: (label: string) => Promise<string>;
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
  createLabel = 'Adicionar novo',
  enableCreate = false,
  onCreate,
}: AutocompleteInputProps<T>) {
  const [pending, setPending] = useState(false);
  const [creating, setCreating] = useState(false);
  const [draftValue, setDraftValue] = useState('');
  const [createdOption, setCreatedOption] = useState<AutocompleteOption | null>(
    null,
  );
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleInputChange = useCallback(
    (_: unknown, inputValue: string, reason: string) => {
      if (reason === 'input') {
        setDraftValue(inputValue);
      } else if (reason === 'clear') {
        setDraftValue('');
      }

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

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const busy = pending || loading || creating;

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => {
        const selectedOption =
          options.find((o) => o.value === field.value) ??
          (createdOption?.value === field.value ? createdOption : null);

        const handleCreate = async () => {
          if (!enableCreate || !onCreate) return;

          const labelToCreate = draftValue.trim() || '';

          setCreating(true);

          try {
            const createdId = await onCreate(labelToCreate);
            const nextOption = { value: createdId, label: labelToCreate };

            setCreatedOption(nextOption);
            field.onChange(createdId);
            setDraftValue(labelToCreate);
          } catch {
            // Drawer-based create can be canceled by the user.
          } finally {
            setCreating(false);
          }
        };

        return (
          <Autocomplete
            options={options}
            filterOptions={(opts) => opts}
            loading={busy}
            disabled={disabled}
            value={selectedOption}
            onChange={(_, newValue) => {
              field.onChange(newValue?.value ?? '');
              setDraftValue(newValue?.label ?? '');
            }}
            onInputChange={handleInputChange}
            getOptionLabel={(option) => option.label}
            isOptionEqualToValue={(option, value) =>
              option.value === value.value
            }
            noOptionsText="Nenhuma opção encontrada"
            loadingText="Carregando..."
            fullWidth
            slots={{
              paper: (paperProps) => (
                <Paper {...paperProps}>
                  {paperProps.children}
                  {enableCreate && onCreate && (
                    <Box
                      sx={{
                        borderTop: '1px solid',
                        borderColor: 'divider',
                        p: 1,
                      }}
                    >
                      <Button
                        variant="contained"
                        fullWidth
                        size="small"
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={handleCreate}
                        disabled={creating}
                      >
                        {creating ? 'Adicionando...' : createLabel}
                      </Button>
                    </Box>
                  )}
                </Paper>
              ),
            }}
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
