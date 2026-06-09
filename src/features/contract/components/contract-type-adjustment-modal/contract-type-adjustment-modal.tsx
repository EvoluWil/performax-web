'use client';

import { TextInput } from '@/components/inputs';
import {
  CloseButtonStyled,
  ModalContainer,
  ModalStyled,
} from '@/components/modal/modal-base.styles';
import { yupResolver } from '@hookform/resolvers/yup';
import { CloseOutlined } from '@mui/icons-material';
import { Box, Button, Typography } from '@mui/material';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { useContractTypeMutation } from '../../hooks/queries/contract-types.query';
import {
  ApplyAdjustmentFormDto,
  applyAdjustmentSchema,
} from '../../schemas/contract-type.schema';
import { ContractType } from '../../types/contract-type';

type Props = {
  open: boolean;
  onClose: () => void;
  contractType: ContractType | null;
};

export const ContractTypeAdjustmentModal: React.FC<Props> = ({
  open,
  onClose,
  contractType,
}) => {
  const mutation = useContractTypeMutation();
  const { control, handleSubmit, reset } = useForm<ApplyAdjustmentFormDto>({
    defaultValues: { percentage: 0 },
    resolver: yupResolver(applyAdjustmentSchema) as any,
  });

  const onSubmit = handleSubmit(async (data) => {
    if (!contractType) return;

    await mutation.mutateAsync({
      type: 'adjustment',
      id: contractType.id,
      percentage: data.percentage,
    });

    toast.success('Reajuste aplicado em todos os contratos ativos deste tipo');
    reset();
    onClose();
  });

  return (
    <ModalStyled open={open} onClose={onClose}>
      <ModalContainer>
        <CloseButtonStyled onClick={onClose}>
          <CloseOutlined />
        </CloseButtonStyled>
        <Typography variant="h6" component="h2" gutterBottom>
          Reajuste — {contractType?.name}
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={2}>
          O percentual será aplicado automaticamente em todos os contratos
          ativos vinculados a este tipo.
        </Typography>
        <Box display="flex" flexDirection="column" gap={2}>
          <TextInput
            label="Reajuste percentual (%)"
            name="percentage"
            control={control}
            type="number"
          />
          <Box display="flex" gap={2}>
            <Button variant="outlined" color="error" onClick={onClose} fullWidth>
              Cancelar
            </Button>
            <Button
              variant="contained"
              onClick={onSubmit}
              loading={mutation.isPending}
              fullWidth
            >
              Aplicar reajuste
            </Button>
          </Box>
        </Box>
      </ModalContainer>
    </ModalStyled>
  );
};
