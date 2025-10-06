import { TextInput } from "@/components/inputs";
import {
  CloseButtonStyled,
  ModalContainer,
  ModalStyled,
} from "@/components/modal";
import { CloseOutlined } from "@mui/icons-material";
import { Box, Button, Typography } from "@mui/material";
import React from "react";
import { useImpediment } from "./impediment.hook";

export type ImpedimentModalProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (impedimentNote: string) => Promise<void>;
};

export const ImpedimentModal: React.FC<ImpedimentModalProps> = ({
  open,
  onClose,
  onSubmit,
}) => {
  const { control, handleClose, handleSave, loading } = useImpediment({
    open,
    onClose,
    onSubmit,
  });

  return (
    <ModalStyled open={open} onClose={handleClose}>
      <ModalContainer onSubmit={handleSave}>
        <CloseButtonStyled onClick={handleClose}>
          <CloseOutlined />
        </CloseButtonStyled>

        <Typography variant="h6">Impedir tarefa</Typography>

        <TextInput
          label="Motivo do impedimento"
          name="impedimentNote"
          placeholder="Descreva o motivo do impedimento da tarefa..."
          control={control}
          defaultValue=""
          fullWidth
          multiline
          minRows={4}
        />

        <Box
          sx={{ display: "flex", gap: 2, justifyContent: "flex-end", mt: 2 }}
        >
          <Button
            variant="outlined"
            color="error"
            onClick={handleClose}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading}
            loading={loading}
          >
            Confirmar impedimento
          </Button>
        </Box>
      </ModalContainer>
    </ModalStyled>
  );
};

export default ImpedimentModal;
