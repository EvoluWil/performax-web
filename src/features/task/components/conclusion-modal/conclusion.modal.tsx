"use client";

import { FileInput } from "@/components/inputs/file-input/file-input";
import { TextInput } from "@/components/inputs/text-input/text-input";
import {
  CloseButtonStyled,
  ModalContainer,
  ModalStyled,
} from "@/components/modal/modal-base.styles";
import { CloseOutlined } from "@mui/icons-material";
import { Alert, Box, Button, Divider, Typography } from "@mui/material";
import React from "react";
import { useConclusion } from "./conclusion.hook";
import { ConclusionSchemaType } from "./conclusion.schema";

type ConclusionModalProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: ConclusionSchemaType) => Promise<void>;
  hasIncompleteChecklist?: boolean;
};

export const ConclusionModal: React.FC<ConclusionModalProps> = ({
  open,
  onClose,
  onSubmit,
  hasIncompleteChecklist,
}) => {
  const { control, handleClose, handleSave, loading } = useConclusion({
    open,
    onClose,
    onSubmit,
    hasIncompleteChecklist,
  });

  return (
    <ModalStyled open={open} onClose={handleClose}>
      <ModalContainer onSubmit={handleSave}>
        <CloseButtonStyled onClick={handleClose}>
          <CloseOutlined />
        </CloseButtonStyled>

        <Box>
          <Typography variant="h6">Finalizar tarefa</Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
            Envie um resumo final e, opcionalmente, arquivos que devem ser
            anexados ao encerramento da tarefa.
          </Typography>

          {hasIncompleteChecklist && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              Existem itens do checklist incompletos. Ao finalizar a tarefa,
              confirme que isso é intencional.
            </Alert>
          )}

          <Box sx={{ mt: 2 }}>
            <TextInput
              name="conclusionNote"
              control={control}
              label="Resumo final"
              multiline
              minRows={4}
            />
          </Box>
        </Box>

        <Box>
          <Typography variant="subtitle1">Anexos</Typography>
          <FileInput
            name="files"
            control={control}
            onRemoveDefaultFile={async () => {}}
            defaultFiles={[]}
            multiple={true}
            label="Anexar arquivos"
          />
        </Box>

        <Divider />

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
            Finalizar tarefa
          </Button>
        </Box>
      </ModalContainer>
    </ModalStyled>
  );
};

export default ConclusionModal;
