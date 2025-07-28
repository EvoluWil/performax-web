import {
  ButtonGroup as BaseButtonGroup,
  ButtonGroupProps as BaseButtonGroupProps,
  Button,
  ButtonProps,
} from '@mui/material';
import { v4 as uuid } from 'uuid';
import { Option } from '../select-input/select-input';

type ButtonGroupProps = BaseButtonGroupProps & {
  value: string;
  onChange: (value: Option['value']) => void;
  options: Option[];
  buttonProps?: ButtonProps;
};

export const ButtonGroup: React.FC<ButtonGroupProps> = ({
  value,
  onChange,
  options,
  buttonProps,
  ...rest
}) => {
  return (
    <BaseButtonGroup size="small" fullWidth {...rest}>
      {options.map((option) => (
        <Button
          key={uuid()}
          fullWidth
          variant={value === option.value ? 'contained' : 'outlined'}
          onClick={() => onChange(option.value)}
          {...buttonProps}
        >
          {option.label}
        </Button>
      ))}
    </BaseButtonGroup>
  );
};
