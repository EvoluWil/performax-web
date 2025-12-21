import { DateInput, SelectInput, TextInput } from "@/components/inputs";
import {
  CloseButtonStyled,
  ModalContainer,
  ModalStyled,
  TwoColumnsContainer,
} from "@/components/modal";
import { CloseOutlined } from "@mui/icons-material";
import { Box, Button, Divider, Typography } from "@mui/material";
import React from "react";
import { useForm, useWatch } from "react-hook-form";
import {
  RECURRENCE_FREQ_OPTIONS,
  RECURRENCE_WEEKDAYS,
  RecurrenceForm,
  recurrenceInitialValues,
} from "./recurrence.schema";
import { buildRRuleFromForm, parseRRuleToForm } from "./useRecurrence";

export type RecurrenceModalProps = {
  open: boolean;
  onClose: () => void;
  initialRRule?: string;
  dtstart?: Date;
  onSubmit: (rrule: string) => Promise<void> | void;
};

export const RecurrenceModal: React.FC<RecurrenceModalProps> = ({
  open,
  onClose,
  initialRRule,
  dtstart,
  onSubmit,
}) => {
  const { control, handleSubmit, reset } = useForm<RecurrenceForm>({
    defaultValues: recurrenceInitialValues,
  });

  React.useEffect(() => {
    if (!initialRRule) return;
    const form = parseRRuleToForm(initialRRule);
    reset({ ...recurrenceInitialValues, ...form });
  }, [initialRRule, reset]);

  const freq = useWatch({ control, name: "freq" });

  const showMonthDay = freq === "MONTHLY";
  const showYearly = freq === "YEARLY";

  const onSave = handleSubmit(async (data) => {
    const rrule = buildRRuleFromForm(data, dtstart);
    await onSubmit(rrule);
    onClose();
  });

  return (
    <ModalStyled open={open} onClose={onClose}>
      <ModalContainer onSubmit={onSave}>
        <CloseButtonStyled onClick={onClose}>
          <CloseOutlined />
        </CloseButtonStyled>
        <Typography variant="h6">Adicionar recorrência</Typography>

        <TwoColumnsContainer>
          <SelectInput
            label="Frequência"
            name="freq"
            control={control}
            options={RECURRENCE_FREQ_OPTIONS}
          />
          <TextInput
            label="Intervalo (a cada)"
            name="interval"
            type="number"
            control={control}
            placeholder={
              freq === "HOURLY"
                ? "ex.: a cada 2 horas"
                : freq === "DAILY"
                ? "ex.: a cada 2 dias"
                : freq === "WEEKLY"
                ? "ex.: a cada 2 semanas"
                : freq === "MONTHLY"
                ? "ex.: a cada 2 meses"
                : "ex.: a cada 2 anos"
            }
          />
        </TwoColumnsContainer>

        <SelectInput
          label="Dias da semana"
          name="byweekday"
          control={control}
          options={RECURRENCE_WEEKDAYS}
          defaultValue={[]}
          slotProps={{
            select: {
              multiple: true,
            },
          }}
          SelectProps={{ multiple: true }}
        />

        {showMonthDay && (
          <TwoColumnsContainer>
            <TextInput
              label="Dia do mês"
              name="bymonthday"
              type="number"
              control={control}
              placeholder="1 a 31"
              defaultValue=""
            />
            <TextInput
              label="Posição na semana"
              name="bysetpos"
              type="number"
              control={control}
              placeholder="1=1ª, 2=2ª, -1=última"
              defaultValue=""
            />
          </TwoColumnsContainer>
        )}

        {showYearly && (
          <TwoColumnsContainer>
            <TextInput
              label="Mês (1 a 12)"
              name="bymonth"
              type="number"
              control={control}
              placeholder="1 a 12"
              defaultValue=""
            />
            <TextInput
              label="Dia do mês"
              name="bymonthday"
              type="number"
              control={control}
              placeholder="1 a 31"
            />
          </TwoColumnsContainer>
        )}

        <Divider />

        <TwoColumnsContainer>
          <TextInput
            label="Qtd. de ocorrências"
            name="count"
            type="number"
            control={control}
            placeholder="ex.: 10"
            defaultValue=""
          />
          <DateInput
            label="Data limite"
            name="until"
            control={control}
            defaultValue={"" as any}
          />
        </TwoColumnsContainer>

        <Box
          sx={{ display: "flex", gap: 2, justifyContent: "flex-end", mt: 2 }}
        >
          <Button variant="outlined" color="error" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="contained" color="primary">
            Confirmar
          </Button>
        </Box>
      </ModalContainer>
    </ModalStyled>
  );
};

export default RecurrenceModal;
