import { parsePickerDate } from '@/utils/date';
import { DatePicker, DatePickerProps } from '@mui/x-date-pickers/DatePicker';
import {
  FieldValues,
  UseControllerProps,
  useController,
} from 'react-hook-form';

export type DateInputProps<T extends FieldValues> = DatePickerProps &
  UseControllerProps<T>;

export function DateInput<T extends FieldValues>({
  name,
  control,
  defaultValue,
  rules,
  shouldUnregister,
  disabled,
  ...rest
}: DateInputProps<T>) {
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

  const isDisabled = disabled || isSubmitting;
  return (
    <DatePicker
      value={parsePickerDate(field.value)}
      onChange={field.onChange}
      sx={{ width: '100%' }}
      disabled={isDisabled}
      slotProps={{
        textField: {
          error: Boolean(error?.message),
          helperText: error?.message,
        },
      }}
      {...rest}
    />
  );
}
