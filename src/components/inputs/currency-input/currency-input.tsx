import {
  InputAdornment,
  OutlinedTextFieldProps,
  TextField,
} from "@mui/material";
import { JSX, useMemo } from "react";
import {
  FieldValues,
  UseControllerProps,
  useController,
} from "react-hook-form";

type OutlinedTextInputPropsEdit = Omit<OutlinedTextFieldProps, "variant">;

export interface CurrencyInputStyledProps extends OutlinedTextInputPropsEdit {
  icon?: JSX.Element;
  variant?: "outlined" | "standard" | "filled";
  locale?: string;
  currency?: string;
  decimals?: number;
  showCurrencySymbol?: boolean;
  onCallback?: (value: number) => void;
}

export type CurrencyInputProps<T extends FieldValues> =
  CurrencyInputStyledProps & UseControllerProps<T>;

function parseToNumber(raw: string, decimals: number): number | "" {
  const digits = (raw || "").replace(/\D/g, "");
  if (!digits) return "";
  const intVal = parseInt(digits, 10);
  if (Number.isNaN(intVal)) return "";
  return intVal / Math.pow(10, decimals);
}

export function CurrencyInput<T extends FieldValues>({
  name,
  icon,
  control,
  defaultValue,
  rules,
  shouldUnregister,
  disabled,
  onCallback,
  variant = "outlined",
  locale = "pt-BR",
  currency = "BRL",
  decimals = 2,
  showCurrencySymbol = true,
  ...rest
}: CurrencyInputProps<T>) {
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

  const formatter = useMemo(() => {
    return new Intl.NumberFormat(
      locale,
      showCurrencySymbol
        ? {
            style: "currency",
            currency,
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals,
          }
        : { minimumFractionDigits: decimals, maximumFractionDigits: decimals }
    );
  }, [locale, currency, decimals, showCurrencySymbol]);

  const displayValue = useMemo(() => {
    const value = field.value as unknown;
    if (value === undefined || value === null || value === "") return "";

    const numeric =
      typeof value === "number"
        ? value
        : parseToNumber(String(value), decimals);
    if (numeric === "") return "";
    return formatter.format(numeric as number);
  }, [field.value, formatter, decimals]);

  const { onChange: externalOnChange, ...textFieldProps } = rest as any;

  return (
    <TextField
      fullWidth
      variant={variant}
      helperText={error?.message}
      error={!!error?.message}
      disabled={disabled || isSubmitting}
      required={!!rules?.required}
      value={displayValue}
      sx={{
        "*": { zIndex: 1 },
      }}
      {...textFieldProps}
      onChange={(e) => {
        const parsed = parseToNumber(e.target.value, decimals);
        if (parsed === "") {
          field.onChange("");
          if (externalOnChange) externalOnChange(e);
          return;
        }
        const numeric = parsed as number;
        field.onChange(numeric);

        if (externalOnChange) {
          const nextEvent: any = {
            ...e,
            target: { ...e.target, value: numeric },
            currentTarget: { ...e.currentTarget, value: numeric },
          };
          externalOnChange(nextEvent);
        }
        if (onCallback) onCallback(numeric);
      }}
      slotProps={{
        input: {
          startAdornment: icon ? (
            <InputAdornment
              position="start"
              sx={{ color: disabled ? "text.disabled" : "primary.main" }}
            >
              {icon}
            </InputAdornment>
          ) : null,
        },
      }}
    />
  );
}
