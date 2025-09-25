import { MenuItem } from '@mui/material';
import { FieldValues, UseControllerProps } from 'react-hook-form';
import { TextInput, TextInputStyledProps } from '../text-input/text-input';

export type Option<T = FieldValues> = {
  label: string;
  value: string;
  data?: T;
};

type SelectStyledProps = {
  options: Option[];
} & TextInputStyledProps;

export type SelectProps<T extends FieldValues> = SelectStyledProps &
  UseControllerProps<T>;

export function SelectInput<T extends FieldValues>({
  options,
  ...rest
}: SelectProps<T>) {
  return (
    <TextInput select {...rest}>
      {options?.map((option) => (
        <MenuItem key={option.value} value={option.value}>
          {option.label}
        </MenuItem>
      ))}
    </TextInput>
  );
}
