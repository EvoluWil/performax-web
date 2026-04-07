'use client';

import { BaseDrawer } from '@/components/drawer';
import { TextInput } from '@/components/inputs';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  Autocomplete,
  Avatar,
  Box,
  Button,
  CircularProgress,
  TextField,
  Typography,
} from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { useFinanceBankMutation } from '../../hooks/queries/finance-banks.query';
import {
  FinanceBankFormDto,
  financeBankFormInitialValues,
  financeBankFormSchema,
} from '../../schemas/finance-bank-drawer.schema';
import type { FinanceBank } from '../../types/finance-bank';

type BrasilApiBank = {
  ispb: string;
  name: string;
  code: number | null;
  fullName: string;
};

async function fetchBrasilApiBanks(): Promise<BrasilApiBank[]> {
  const res = await fetch('https://brasilapi.com.br/api/banks/v1');
  if (!res.ok) return [];
  return res.json();
}

export type FinanceBankDrawerProps = {
  open: boolean;
  onClose: () => void;
  financeBank: FinanceBank | null;
};

export const FinanceBankDrawer: React.FC<FinanceBankDrawerProps> = ({
  open,
  onClose,
  financeBank,
}) => {
  const [loading, setLoading] = useState(false);
  const [apibanks, setApiBanks] = useState<BrasilApiBank[]>([]);
  const [apiBanksLoading, setApiBanksLoading] = useState(false);
  const [selectedApiBank, setSelectedApiBank] = useState<BrasilApiBank | null>(
    null,
  );

  const mutation = useFinanceBankMutation();

  const { control, handleSubmit, reset, setValue } =
    useForm<FinanceBankFormDto>({
      defaultValues: financeBankFormInitialValues,
      resolver: yupResolver(financeBankFormSchema) as any,
    });

  useEffect(() => {
    if (!open) return;
    setApiBanksLoading(true);
    fetchBrasilApiBanks()
      .then(setApiBanks)
      .finally(() => setApiBanksLoading(false));
  }, [open]);

  useEffect(() => {
    if (open && financeBank) {
      reset({ name: financeBank.name, code: financeBank.code });
      setSelectedApiBank(null);
    } else if (open) {
      reset(financeBankFormInitialValues);
      setSelectedApiBank(null);
    }
  }, [open, financeBank, reset]);

  const bankOptions = useMemo(
    () => apibanks.filter((b) => b.name && b.code !== null),
    [apibanks],
  );

  const handleBankSelect = (_: unknown, bank: BrasilApiBank | null) => {
    setSelectedApiBank(bank);
    if (bank) {
      setValue('name', bank.fullName || bank.name);
      setValue('code', bank.code?.toString() ?? '');
    }
  };

  const handleSave = handleSubmit(async (values) => {
    setLoading(true);
    try {
      if (financeBank) {
        await mutation.mutateAsync({
          type: 'update',
          id: financeBank.id,
          data: values,
        });
        toast.success('Banco atualizado com sucesso');
      } else {
        await mutation.mutateAsync({ type: 'create', data: values });
        toast.success('Banco criado com sucesso');
      }
      onClose();
    } catch {
      toast.error('Erro ao salvar banco');
    } finally {
      setLoading(false);
    }
  });

  return (
    <BaseDrawer
      open={open}
      setOpen={onClose}
      height="auto"
      title={financeBank ? 'Editar Banco' : 'Novo Banco'}
      content={
        <Box display="flex" flexDirection="column" gap={2}>
          {!financeBank && (
            <>
              <Autocomplete
                options={bankOptions}
                loading={apiBanksLoading}
                getOptionLabel={(b) => `${b.code} - ${b.name}`}
                value={selectedApiBank}
                onChange={handleBankSelect}
                renderOption={(props, b) => (
                  <Box
                    component="li"
                    display="flex"
                    alignItems="center"
                    gap={1}
                    {...props}
                  >
                    <Avatar
                      src={`https://logo.clearbit.com/${encodeURIComponent(b.name.toLowerCase())}.com.br`}
                      sx={{ width: 24, height: 24, fontSize: 12 }}
                    >
                      {b.name[0]}
                    </Avatar>
                    <Box>
                      <Typography variant="body2">{b.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Código: {b.code}
                      </Typography>
                    </Box>
                  </Box>
                )}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Buscar banco"
                    size="small"
                    slotProps={{
                      input: {
                        ...params.InputProps,
                        endAdornment: (
                          <>
                            {apiBanksLoading && <CircularProgress size={16} />}
                            {params.InputProps.endAdornment}
                          </>
                        ),
                      },
                    }}
                  />
                )}
              />
              <Typography variant="caption" color="text.secondary">
                Não encontrou? Preencha manualmente abaixo.
              </Typography>
            </>
          )}

          <TextInput label="Nome" name="name" control={control} />
          <TextInput label="Código" name="code" control={control} />

          <Box display="flex" gap={2} mt="auto">
            <Button
              variant="outlined"
              color="error"
              onClick={onClose}
              fullWidth
            >
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
        </Box>
      }
    />
  );
};
