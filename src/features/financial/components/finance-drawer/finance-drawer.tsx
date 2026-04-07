'use client';

import { BaseDrawer } from '@/components/drawer';
import {
  AutocompleteInput,
  CurrencyInput,
  DateInput,
  SelectInput,
  TextInput,
} from '@/components/inputs';
import { RecurrenceModal } from '@/components/modal';
import { formatRRuleToText } from '@/utils/rrule';
import { Box, Button, Typography } from '@mui/material';
import { grey } from '@mui/material/colors';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useWatch } from 'react-hook-form';
import type { Finance } from '../../types/finance';
import { FinanceFlowEnum } from '../../types/finance';
import { useFinanceDrawer } from './finance-drawer.hook';

// Transfer is only accessible via the explicit Transfer button, not from create
const flowOptions = [
  { value: FinanceFlowEnum.IN, label: 'Entrada' },
  { value: FinanceFlowEnum.OUT, label: 'Saída' },
];

export type FinanceDrawerProps = {
  open: boolean;
  onClose: () => void;
  finance: Finance | null;
  onSuccess?: () => void;
};

export const FinanceDrawer: React.FC<FinanceDrawerProps> = (props) => {
  const {
    control,
    handleFinance,
    loading,
    handleClose,
    open,
    editing,
    options,
    setSearch,
    isOutFlow,
    needApprove,
    showResponsibleSelect,
    setValue,
    hasRecurrence,
  } = useFinanceDrawer(props);

  const router = useRouter();
  const [openRecurrence, setOpenRecurrence] = useState(false);
  const recurrence =
    (useWatch({ control, name: 'recurrence' }) as string) || '';
  const dateValue = useWatch({ control, name: 'date' }) as string;

  const recurrenceMasterId = props.finance?.recurrenceMasterId;

  return (
    <>
      <BaseDrawer
        open={open}
        setOpen={handleClose}
        height="auto"
        title={editing ? 'Editar Lançamento' : 'Novo Lançamento'}
        content={
          <Box
            gap={2}
            component="form"
            display="flex"
            alignItems="center"
            justifyContent="center"
            flexDirection="column"
            flex={1}
          >
            {needApprove && (
              <Box
                bgcolor="warning.light"
                color="warning.contrastText"
                borderRadius={1}
                px={2}
                py={1}
                width="100%"
              >
                <Typography variant="caption">
                  Este centro de custo requer aprovação antes de ser processado.
                </Typography>
              </Box>
            )}
            <SelectInput
              label="Fluxo"
              name="flow"
              control={control}
              options={flowOptions}
            />
            <TextInput
              label="Título"
              name="title"
              placeholder="Digite o título do lançamento"
              control={control}
            />
            <Box
              display="grid"
              gridTemplateColumns="1fr 1fr"
              gap={2}
              width="100%"
            >
              <CurrencyInput label="Valor" name="value" control={control} />
              <DateInput
                label="Data de vencimento"
                name="date"
                control={control}
              />
            </Box>
            <AutocompleteInput
              label="Banco"
              name="bankId"
              control={control}
              options={options.financeBanks ?? []}
              onInputChange={(v) => setSearch('financeBanks', v)}
            />
            <AutocompleteInput
              label="Método de Pagamento"
              name="methodId"
              control={control}
              options={options.financePaymentMethods ?? []}
              onInputChange={(v) => setSearch('financePaymentMethods', v)}
            />
            <AutocompleteInput
              label="Centro de Custo"
              name="typeId"
              control={control}
              options={options.financeTypes ?? []}
              onInputChange={(v) => setSearch('financeTypes', v)}
            />
            <AutocompleteInput
              label="Categoria"
              name="categoryId"
              control={control}
              options={options.financeCategories ?? []}
              onInputChange={(v) => setSearch('financeCategories', v)}
            />
            <AutocompleteInput
              label="Segmento"
              name="segmentId"
              control={control}
              options={options.financeSegments ?? []}
              onInputChange={(v) => setSearch('financeSegments', v)}
            />
            {showResponsibleSelect && (
              <AutocompleteInput
                label="Responsável"
                name="responsibleId"
                control={control}
                options={options.users ?? []}
                onInputChange={(v) => setSearch('users', v)}
              />
            )}
            <AutocompleteInput
              label="Funcionário (opcional)"
              name="employeeId"
              control={control}
              options={options.employees ?? []}
              onInputChange={(v) => setSearch('employees', v)}
            />
            <AutocompleteInput
              label="Cliente (opcional)"
              name="clientId"
              control={control}
              options={options.clients ?? []}
              onInputChange={(v) => setSearch('clients', v)}
            />
            {isOutFlow && (
              <AutocompleteInput
                label="Favorecido"
                name="payeeId"
                control={control}
                options={options.financePayees ?? []}
                onInputChange={(v) => setSearch('financePayees', v)}
              />
            )}
            <TextInput
              label="Descrição"
              name="description"
              placeholder="Descreva o lançamento"
              control={control}
              multiline
              minRows={2}
            />
            <TextInput
              label="Observações"
              name="observation"
              placeholder="Digite observações"
              control={control}
              multiline
              minRows={2}
            />

            {(!editing || !!recurrenceMasterId || !!recurrence) && (
              <Box
                p={2}
                width="100%"
                display="flex"
                flexDirection="column"
                gap={2}
                border={({ palette }) => `1px solid ${palette.primary.main}`}
                borderRadius={1}
              >
                <Typography
                  variant="h6"
                  textAlign="left"
                  color="primary"
                  width="100%"
                >
                  Recorrência
                </Typography>

                {/* Editing a finance that already belongs to a recurring series */}
                {editing && recurrenceMasterId && (
                  <Box
                    sx={{
                      p: 2,
                      backgroundColor: grey[50],
                      borderRadius: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 1,
                    }}
                  >
                    {recurrence && (
                      <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                        {formatRRuleToText(recurrence)}
                      </Typography>
                    )}
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => {
                        handleClose();
                        router.push('/panel/financial/recurring');
                      }}
                      fullWidth
                    >
                      Ver recorrências
                    </Button>
                  </Box>
                )}

                {/* Create / edit own recurrence (new finance or finance that owns the recurrence) */}
                {(!editing || !recurrenceMasterId) && (
                  <Box display="flex" flexDirection="column" gap={1}>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => setOpenRecurrence(true)}
                      fullWidth
                    >
                      {recurrence ? 'Editar' : 'Definir'} recorrência
                    </Button>
                    {recurrence && (
                      <Button
                        variant="text"
                        size="small"
                        color="error"
                        onClick={() => setValue('recurrence', '')}
                        fullWidth
                      >
                        Limpar recorrência
                      </Button>
                    )}
                  </Box>
                )}
                {recurrence && !recurrenceMasterId && (
                  <Box
                    sx={{ p: 2, backgroundColor: grey[50], borderRadius: 1 }}
                  >
                    <Typography variant="subtitle2">
                      Recorrência configurada:
                    </Typography>
                    <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                      {formatRRuleToText(recurrence)}
                    </Typography>
                  </Box>
                )}
              </Box>
            )}

            <Box display="flex" gap={2} mt="auto" width="100%">
              <Button
                variant="outlined"
                color="error"
                onClick={handleClose}
                fullWidth
              >
                Cancelar
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handleFinance}
                type="submit"
                loading={loading}
                fullWidth
              >
                Confirmar
              </Button>
            </Box>
          </Box>
        }
      />
      <RecurrenceModal
        open={openRecurrence}
        onClose={() => setOpenRecurrence(false)}
        initialRRule={recurrence}
        dtstart={dateValue ? new Date(dateValue) : undefined}
        onSubmit={(rrule) => {
          setValue('recurrence', rrule);
          setOpenRecurrence(false);
        }}
      />
    </>
  );
};
