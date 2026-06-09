'use client';

import {
  CloseButtonStyled,
  ModalContainer,
  ModalStyled,
} from '@/components/modal/modal-base.styles';
import { useUpload } from '@/hooks/common/upload';
import { CloseOutlined } from '@mui/icons-material';
import { Box, Button, Link, Typography } from '@mui/material';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { contractService } from '../../services/contract.service';
import { Contract } from '../../types/contract';

type Props = {
  open: boolean;
  onClose: () => void;
  contract: Contract;
  onSuccess?: () => void;
};

export const SignedContractModal: React.FC<Props> = ({
  open,
  onClose,
  contract,
  onSuccess,
}) => {
  const { sendFile, deleteFile } = useUpload();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!file) {
      toast.error('Selecione um arquivo PDF');
      return;
    }

    setLoading(true);
    try {
      if (contract.attachment?.url) {
        await deleteFile(contract.attachment.url);
      }

      const uploaded = await sendFile(file, 'contracts/signed');
      if (!uploaded) return;

      await contractService.updateSignedAttachment(contract.id, {
        attachment: uploaded,
      });

      toast.success('Contrato assinado salvo com sucesso');
      onSuccess?.();
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalStyled open={open} onClose={onClose}>
      <ModalContainer>
        <CloseButtonStyled onClick={onClose}>
          <CloseOutlined />
        </CloseButtonStyled>
        <Typography variant="h6" component="h2" gutterBottom>
          Contrato assinado
        </Typography>

        {contract.attachment?.url && (
          <Box mb={2}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Arquivo atual:
            </Typography>
            <Link href={contract.attachment.url} target="_blank">
              Ver PDF assinado
            </Link>
          </Box>
        )}

        <Box mb={2}>
          <input
            accept="application/pdf,.pdf"
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </Box>

        <Box display="flex" gap={2}>
          <Button variant="outlined" color="error" onClick={onClose} fullWidth>
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            loading={loading}
            fullWidth
          >
            Salvar
          </Button>
        </Box>
      </ModalContainer>
    </ModalStyled>
  );
};
