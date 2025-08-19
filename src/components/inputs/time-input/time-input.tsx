import { TimePicker, TimePickerProps } from '@mui/x-date-pickers/TimePicker';
import {
  FieldValues,
  UseControllerProps,
  useController,
} from 'react-hook-form';

export type TimeInputProps<T extends FieldValues> = TimePickerProps &
  UseControllerProps<T>;

export function TimeInput<T extends FieldValues>({
  name,
  control,
  defaultValue,
  rules,
  shouldUnregister,
  disabled,
  ...rest
}: TimeInputProps<T>) {
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
    <TimePicker
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
