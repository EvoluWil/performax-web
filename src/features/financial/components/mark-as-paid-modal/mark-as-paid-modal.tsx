'use client';

import { AutocompleteInput, CurrencyInput, DateInput } from '@/components/inputs';
import {
  CloseButtonStyled,
  ModalContainer,
  ModalStyled,
} from '@/components/modal';
import { yupResolver } from '@hookform/resolvers/yup';
import { CloseOutlined } from '@mui/icons-material';
import {
  Box,
  Button,
  FormControlLabel,
  Switch,
  Typography,
} from '@mui/material';
import { useMemo, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { toast } from 'react-toastify';
import * as yup from 'yup';
import { useFinanceAdvancesAvailableQuery } from '../../hooks/queries/finance-advances.query';
import { useFinanceMutation } from '../../hooks/queries/finances.query';
import { Finance, FinanceFlowEnum } from '../../types/finance';

type MarkAsPaidFormDto = {
  paymentDate: string;
  tax: number;
  retention: number;
  paidFromAdvance: boolean;
  advanceId: string;
};

function getNetWalletImpact(
  flow: FinanceFlowEnum,
  valueCents: number,
  taxCents: number,
  retentionCents: number,
) {
  if (flow === FinanceFlowEnum.IN) {
    return valueCents - taxCents - retentionCents;
  }
  return valueCents + taxCents + retentionCents;
}

function formatCurrency(cents: number) {
  return (cents / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

const schema = yup.object().shape({
  paymentDate: yup
    .string()
    .required('Data de pagamento é obrigatória')
    .transform((v) => v && new Date(v).toISOString()),
  tax: yup.number().min(0).default(0),
  retention: yup.number().min(0).default(0),
  paidFromAdvance: yup.boolean().default(false),
  advanceId: yup.string().when('paidFromAdvance', {
    is: true,
    then: (s) => s.required('Selecione o adiantamento'),
    otherwise: (s) => s.optional(),
  }),
});

const initialValues: MarkAsPaidFormDto = {
  paymentDate: '',
  tax: 0,
  retention: 0,
  paidFromAdvance: false,
  advanceId: '',
};

export type MarkAsPaidModalProps = {
  open: boolean;
  onClose: () => void;
  finance: Finance | null;
  onSuccess?: () => void;
};

export const MarkAsPaidModal: React.FC<MarkAsPaidModalProps> = ({
  open,
  onClose,
  finance,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const mutation = useFinanceMutation(finance?.id);

  const { control, handleSubmit, reset, setValue } = useForm<MarkAsPaidFormDto>(
    {
      defaultValues: initialValues,
      resolver: yupResolver(schema) as any,
    },
  );

  const paidFromAdvance = useWatch({ control, name: 'paidFromAdvance' });
  const tax = useWatch({ control, name: 'tax' });
  const retention = useWatch({ control, name: 'retention' });

  const { data: availableAdvances } = useFinanceAdvancesAvailableQuery(
    open && !!finance && !finance.isInstallment,
  );

  const requiredAmount = useMemo(() => {
    if (!finance) return 0;
    return getNetWalletImpact(
      finance.flow,
      finance.value,
      Math.round(Number(tax || 0) * 100),
      Math.round(Number(retention || 0) * 100),
    );
  }, [finance, tax, retention]);

  const advanceOptions = useMemo(() => {
    return (availableAdvances ?? [])
      .filter((a) => a.remainingValue >= requiredAmount)
      .map((a) => ({
        value: a.id,
        label: `${a.title} — saldo ${formatCurrency(a.remainingValue)}`,
      }));
  }, [availableAdvances, requiredAmount]);

  const handleClose = () => {
    reset(initialValues);
    onClose();
  };

  const handleSave = handleSubmit(async (values) => {
    if (!finance) return;

    if (values.paidFromAdvance && !values.advanceId) {
      toast.error('Selecione o adiantamento');
      return;
    }

    setLoading(true);
    try {
      await mutation.mutateAsync({
        type: 'update',
        id: finance.id,
        data: {
          status: 'PAID' as any,
          paymentDate: values.paymentDate as any,
          tax: Math.round(Number(values.tax || 0) * 100),
          retention: Math.round(Number(values.retention || 0) * 100),
          paidFromAdvance: values.paidFromAdvance,
          advanceId: values.paidFromAdvance ? values.advanceId : undefined,
        } as any,
      });
      toast.success(
        values.paidFromAdvance
          ? 'Lançamento pago com adiantamento'
          : 'Lançamento marcado como pago',
      );
      onSuccess?.();
      handleClose();
    } catch {
      toast.error('Erro ao marcar como pago');
    } finally {
      setLoading(false);
    }
  });

  const canUseAdvance =
    !!finance && !finance.isInstallment && !finance.isAdvanceDeposit;

  return (
    <ModalStyled open={open} onClose={handleClose}>
      <ModalContainer onSubmit={handleSave}>
        <CloseButtonStyled onClick={handleClose}>
          <CloseOutlined />
        </CloseButtonStyled>

        <Typography variant="h6" mb={1}>
          Marcar como Pago
        </Typography>
        {finance && (
          <Typography variant="body2" color="text.secondary" mb={2}>
            {finance.title}
          </Typography>
        )}

        <Box display="flex" flexDirection="column" gap={2}>
          <DateInput
            label="Data de Pagamento"
            name="paymentDate"
            control={control}
          />
          <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2}>
            <CurrencyInput label="Taxa" name="tax" control={control} />
            <CurrencyInput
              label="Retenção"
              name="retention"
              control={control}
            />
          </Box>

          {canUseAdvance && (
            <>
              <FormControlLabel
                control={
                  <Switch
                    checked={!!paidFromAdvance}
                    onChange={(e) => {
                      setValue('paidFromAdvance', e.target.checked);
                      if (!e.target.checked) setValue('advanceId', '');
                    }}
                  />
                }
                label="Pago com adiantamento"
              />

              {paidFromAdvance && (
                <Box>
                  <AutocompleteInput
                    label="Adiantamento"
                    name="advanceId"
                    control={control}
                    options={advanceOptions}
                  />
                  <Typography variant="caption" color="text.secondary">
                    Valor a abater: {formatCurrency(requiredAmount)}. O saldo
                    da empresa não será alterado — o valor já entrou ao criar o
                    adiantamento.
                  </Typography>
                  {advanceOptions.length === 0 && (
                    <Typography variant="caption" color="error" display="block">
                      Nenhum adiantamento disponível com saldo suficiente.
                    </Typography>
                  )}
                </Box>
              )}
            </>
          )}
        </Box>

        <Box display="flex" gap={2} justifyContent="flex-end" mt={3}>
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
            color="success"
            loading={loading}
            disabled={paidFromAdvance && advanceOptions.length === 0}
          >
            Confirmar Pagamento
          </Button>
        </Box>
      </ModalContainer>
    </ModalStyled>
  );
};
