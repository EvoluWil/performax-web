import {
  ButtonGroup as BaseButtonGroup,
  ButtonGroupProps as BaseButtonGroupProps,
  Button,
  ButtonProps,
  FormControl,
  InputLabel,
} from "@mui/material";
import { v4 as uuid } from "uuid";
import { Option } from "../select-input/select-input";

type ButtonGroupProps = BaseButtonGroupProps & {
  value: string | string[];
  onChange: (value: Option["value"] | Option["value"][]) => void;
  options: Option[];
  buttonProps?: ButtonProps;
  multiple?: boolean;
  label?: string;
};

export const ButtonGroup: React.FC<ButtonGroupProps> = ({
  value,
  onChange,
  options,
  multiple = false,
  buttonProps,
  label,
  ...rest
}) => {
  const handleChange = (optionValue: Option["value"]) => {
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

  const isSelected = (optionValue: Option["value"]) => {
    if (multiple) {
      return Array.isArray(value) && value.includes(optionValue);
    }
    return value === optionValue;
  };

  const buttonGroup = (
    <BaseButtonGroup size="small" fullWidth {...rest}>
      {options.map((option) => (
        <Button
          key={uuid()}
          fullWidth
          variant={isSelected(option.value) ? "contained" : "outlined"}
          onClick={() => handleChange(option.value)}
          {...buttonProps}
        >
          {option.label}
        </Button>
      ))}
    </BaseButtonGroup>
  );

  if (label) {
    return (
      <FormControl fullWidth>
        <InputLabel
          shrink
          sx={{
            position: "relative",
            transform: "none",
            fontSize: "0.75rem",
            color: "rgba(0, 0, 0, 0.6)",
            marginBottom: 1,
          }}
        >
          {label}
        </InputLabel>
        {buttonGroup}
      </FormControl>
    );
  }

  return buttonGroup;
};
