'use client';

import { FileInput } from '@/components/inputs';
import {
  CloseButtonStyled,
  ModalContainer,
  ModalStyled,
} from '@/components/modal';
import { CloseOutlined } from '@mui/icons-material';
import { Box, Button, Typography } from '@mui/material';
import { useForm } from 'react-hook-form';

type AttachFilesForm = {
  files: File[];
};

type AttachFilesModalProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (files: File[]) => Promise<void>;
  loading?: boolean;
};

export const AttachFilesModal = ({
  open,
  onClose,
  onSubmit,
  loading,
}: AttachFilesModalProps) => {
  const { control, handleSubmit, reset } = useForm<AttachFilesForm>({
    defaultValues: { files: [] },
  });

  const onValid = async (values: AttachFilesForm) => {
    await onSubmit(values.files ?? []);
    reset();
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <ModalStyled open={open} onClose={handleClose}>
      <ModalContainer onSubmit={handleSubmit(onValid)}>
        <CloseButtonStyled onClick={handleClose}>
          <CloseOutlined />
        </CloseButtonStyled>

        <Box>
          <Typography variant="h6">Adicionar Anexos</Typography>
          <Typography variant="body2" color="text.secondary" mt={1}>
            Selecione um ou mais arquivos para anexar a esta OS.
          </Typography>
        </Box>

        <Box mt={2}>
          <FileInput
            name="files"
            control={control}
            onRemoveDefaultFile={async () => {}}
            defaultFiles={[]}
            multiple
            label="Selecionar arquivos"
          />
        </Box>

        <Box display="flex" gap={2} justifyContent="flex-end" mt={2}>
          <Button
            variant="outlined"
            color="inherit"
            onClick={handleClose}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button type="submit" variant="contained" loading={loading}>
            Anexar
          </Button>
        </Box>
      </ModalContainer>
    </ModalStyled>
  );
};
