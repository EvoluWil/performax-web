import {
  DateTimePicker,
  DateTimePickerProps,
} from '@mui/x-date-pickers/DateTimePicker';
import {
  FieldValues,
  UseControllerProps,
  useController,
} from 'react-hook-form';

export type DateTimeInputProps<T extends FieldValues> = DateTimePickerProps &
  UseControllerProps<T>;

export function DateTimeInput<T extends FieldValues>({
  name,
  control,
  defaultValue,
  rules,
  shouldUnregister,
  disabled,
  ...rest
}: DateTimeInputProps<T>) {
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
    <DateTimePicker
      value={field.value}
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
