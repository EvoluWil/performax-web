'use client';

import AddIcon from '@mui/icons-material/Add';
import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
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
  /** Multiselect mode — used in filters only; field value is string[] */
  multiple?: boolean;
  /** Called with the debounced input text — use to drive server search */
  onInputChange?: (value: string) => void;
  createLabel?: string;
  enableCreate?: boolean;
  onCreate?: (label: string) => Promise<string>;
};

function mergeOptions(
  options: AutocompleteOption[],
  selected: AutocompleteOption[],
): AutocompleteOption[] {
  const map = new Map<string, AutocompleteOption>();
  for (const option of [...selected, ...options]) {
    if (option.value) map.set(option.value, option);
  }
  return Array.from(map.values());
}

export function AutocompleteInput<T extends FieldValues>({
  name,
  control,
  label,
  options,
  placeholder,
  disabled,
  loading,
  multiple = false,
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
  const [selectedCache, setSelectedCache] = useState<AutocompleteOption[]>([]);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const canCreate = !multiple && enableCreate && !!onCreate;

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
        const fieldValues = multiple
          ? ((field.value as string[] | undefined) ?? [])
          : [];

        let selectedOptions: AutocompleteOption | AutocompleteOption[] | null;

        if (multiple) {
          const fromOptions = options.filter((o) =>
            fieldValues.includes(o.value),
          );
          const fromCache = selectedCache.filter((o) =>
            fieldValues.includes(o.value),
          );
          selectedOptions = mergeOptions(fromOptions, fromCache);
        } else {
          selectedOptions =
            options.find((o) => o.value === field.value) ??
            (createdOption?.value === field.value ? createdOption : null);
        }

        const mergedOptions = multiple
          ? mergeOptions(
              options,
              Array.isArray(selectedOptions) ? selectedOptions : [],
            )
          : options;

        const handleCreate = async () => {
          if (!canCreate || !onCreate) return;

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
            multiple={multiple}
            options={mergedOptions}
            filterOptions={(opts) => opts}
            loading={busy}
            disabled={disabled}
            disableCloseOnSelect={multiple}
            value={
              multiple
                ? (selectedOptions as AutocompleteOption[])
                : (selectedOptions as AutocompleteOption | null)
            }
            onChange={(_, newValue) => {
              if (multiple) {
                const next = (newValue as AutocompleteOption[]) ?? [];
                setSelectedCache(next);
                field.onChange(next.map((o) => o.value));
                return;
              }

              const single = newValue as AutocompleteOption | null;
              field.onChange(single?.value ?? '');
              setDraftValue(single?.label ?? '');
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
                  {canCreate && (
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
                        onMouseDown={(e) => e.preventDefault()}
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
                        {canCreate && (
                          <InputAdornment position="end">
                            <Tooltip title={createLabel}>
                              <IconButton
                                size="small"
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={handleCreate}
                                disabled={creating}
                                edge="end"
                                tabIndex={-1}
                              >
                                <AddIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </InputAdornment>
                        )}
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
