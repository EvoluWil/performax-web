import { SelectInput, TextInput } from "@/components/inputs";
import {
  CloseButtonStyled,
  ModalContainer,
  ModalStyled,
  TwoColumnsContainer,
} from "@/components/modal";
import { CloseOutlined } from "@mui/icons-material";
import { Box, Button, IconButton, Tooltip, Typography } from "@mui/material";
import { Control, useFieldArray } from "react-hook-form";
import { useChecklist } from "./checklist.hook";

export type ChecklistModalProps = {
  open: boolean;
  onClose: () => void;
  onSuccess?: (payload: any) => void;
  startWithModule?: boolean;
};

const ModuleItems: React.FC<{ control: Control<any>; moduleIndex: number }> = ({
  control,
  moduleIndex,
}) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `modules.${moduleIndex}.items` as any,
  });

  return (
    <div>
      {fields.map((fieldItem, itemIndex) => (
        <Box
          key={fieldItem.id}
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr auto" },
            gap: 1,
            alignItems: "center",
            marginTop: 1,
          }}
        >
          <TextInput
            label="Pergunta"
            name={`modules.${moduleIndex}.items.${itemIndex}.question` as any}
            control={control}
            defaultValue={(fieldItem as any).question || ""}
            fullWidth
          />
          <SelectInput
            label="Tipo esperado"
            name={
              `modules.${moduleIndex}.items.${itemIndex}.expectedType` as any
            }
            control={control}
            defaultValue={(fieldItem as any).expectedType || "BOOLEAN"}
            options={[
              { label: "escolha", value: "BOOLEAN" },
              { label: "texto", value: "TEXT" },
              { label: "numero", value: "NUMBER" },
            ]}
            fullWidth
          />
          <Box
            sx={{
              display: "flex",
              justifyContent: { xs: "flex-start", md: "flex-end" },
            }}
          >
            <Tooltip title="Remover item">
              <IconButton
                color="error"
                onClick={() => remove(itemIndex)}
                type="button"
              >
                <CloseOutlined />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      ))}
      <Button
        onClick={() => append({ question: "", expectedType: "BOOLEAN" })}
        variant="outlined"
        type="button"
        sx={{ my: 2 }}
      >
        Adicionar item
      </Button>
    </div>
  );
};

export const ChecklistModal: React.FC<ChecklistModalProps> = ({
  open,
  onClose,
  onSuccess,
  startWithModule = false,
}) => {
  const { control, modules, handleClose, handleSave } = useChecklist({
    open,
    onClose,
    onSuccess,
    startWithModule,
  });

  return (
    <ModalStyled open={open} onClose={handleClose}>
      <ModalContainer>
        <CloseButtonStyled onClick={handleClose}>
          <CloseOutlined />
        </CloseButtonStyled>

        <Typography variant="h6">Adicionar checklist</Typography>

        {modules.length > 0 ? (
          <div key={modules[0].id}>
            <TwoColumnsContainer>
              <TextInput
                label="Nome do checklist"
                name={`modules.0.name` as any}
                control={control}
                defaultValue={modules[0].name}
                fullWidth
                sx={{ width: "100%", gridColumn: "1 / -1" }}
              />
            </TwoColumnsContainer>

            <div style={{ marginTop: 8 }}>
              <ModuleItems control={control} moduleIndex={0} />
            </div>
          </div>
        ) : null}

        <div
          style={{
            display: "flex",
            gap: 8,
            marginTop: 12,
            justifyContent: "flex-end",
            width: "100%",
          }}
        >
          <Button variant="outlined" color="error" onClick={handleClose}>
            Cancelar
          </Button>
          <Button variant="contained" color="primary" onClick={handleSave}>
            Salvar checklist
          </Button>
        </div>
      </ModalContainer>
    </ModalStyled>
  );
};
