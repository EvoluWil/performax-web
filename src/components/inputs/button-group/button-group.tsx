import {
  ButtonGroup as BaseButtonGroup,
  ButtonGroupProps as BaseButtonGroupProps,
  Button,
  ButtonProps,
} from '@mui/material';
import { v4 as uuid } from 'uuid';
import { Option } from '../select-input/select-input';

type ButtonGroupProps = BaseButtonGroupProps & {
  value: string | string[];
  onChange: (value: Option['value'] | Option['value'][]) => void;
  options: Option[];
  buttonProps?: ButtonProps;
  multiple?: boolean;
};

export const ButtonGroup: React.FC<ButtonGroupProps> = ({
  value,
  onChange,
  options,
  multiple = false,
  buttonProps,
  ...rest
}) => {
  const handleChange = (optionValue: Option['value']) => {
    if (multiple) {
      if (Array.isArray(value)) {
        if (value.includes(optionValue)) {
          onChange(value.filter((v) => v !== optionValue));
        } else {
          onChange([...value, optionValue]);
        }
      } else {
        onChange([value, optionValue]);
      }
    } else {
      onChange(optionValue);
    }
  };

  const isSelected = (optionValue: Option['value']) => {
    if (multiple) {
      return Array.isArray(value) && value.includes(optionValue);
    }
    return value === optionValue;
  };

  return (
    <BaseButtonGroup size="small" fullWidth {...rest}>
      {options.map((option) => (
        <Button
          key={uuid()}
          fullWidth
          variant={isSelected(option.value) ? 'contained' : 'outlined'}
          onClick={() => handleChange(option.value)}
          {...buttonProps}
        >
          {option.label}
        </Button>
      ))}
    </BaseButtonGroup>
  );
};
