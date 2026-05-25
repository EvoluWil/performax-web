'use client';

import { BaseDrawer } from '@/components/drawer';
import {
  AutocompleteInput,
  CurrencyInput,
  DateInput,
  TextInput,
} from '@/components/inputs';
import { RecurrenceModal } from '@/components/modal';
import { ClientDrawer } from '@/features/client/components/client-drawer/client';
import { EmployeeDrawer } from '@/features/employee/components';
import { UserDrawer } from '@/features/user/components';
import { formatRRuleToText } from '@/utils/rrule';
import {
  Box,
  Button,
  ButtonGroup,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from '@mui/material';
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
    canCreateFinancialField,
    canCreateClient,
    canCreateEmployee,
    canCreateUser,
    handleCreateFinanceBank,
    handleCreateFinancePaymentMethod,
    handleCreateFinanceType,
    handleCreateFinanceSegment,
    handleCreateFinanceCategory,
    handleCreateFinancePayee,
    handleOpenCreateEmployee,
    handleOpenCreateClient,
    clientDrawerOpen,
    clientInitialName,
    handleCloseClientDrawer,
    handleClientCreated,
    handleOpenCreateResponsible,
    responsibleDrawerOpen,
    responsibleInitialName,
    handleCloseResponsibleDrawer,
    handleResponsibleCreated,
    employeeDrawerOpen,
    employeeInitialName,
    handleCloseEmployeeDrawer,
    handleEmployeeCreated,
    setValue,
    paidTo,
    setPaidTo,
    companyOptions,
    selectedCompanyId,
    setSelectedCompanyId,
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
            {companyOptions.length > 1 && (
              <FormControl fullWidth size="small">
                <InputLabel>Empresa</InputLabel>
                <Select
                  label="Empresa"
                  value={selectedCompanyId}
                  onChange={(e) => setSelectedCompanyId(e.target.value)}
                >
                  {companyOptions.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
            <AutocompleteInput
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
            {isOutFlow && (
              <ButtonGroup fullWidth size="small">
                <Button
                  variant={paidTo === 'client' ? 'contained' : 'outlined'}
                  onClick={() => {
                    setPaidTo('client');
                    setValue('employeeId', '');
                    setValue('payeeId', '');
                  }}
                >
                  Cliente
                </Button>
                <Button
                  variant={paidTo === 'employee' ? 'contained' : 'outlined'}
                  onClick={() => {
                    setPaidTo('employee');
                    setValue('clientId', '');
                    setValue('payeeId', '');
                  }}
                >
                  Funcionário
                </Button>
                <Button
                  variant={paidTo === 'other' ? 'contained' : 'outlined'}
                  onClick={() => {
                    setPaidTo('other');
                    setValue('clientId', '');
                    setValue('employeeId', '');
                  }}
                >
                  Outro
                </Button>
              </ButtonGroup>
            )}
            {isOutFlow && paidTo === 'employee' && (
              <AutocompleteInput
                label={isOutFlow ? 'Funcionário' : 'Funcionário (opcional)'}
                name="employeeId"
                control={control}
                options={options.employees ?? []}
                onInputChange={(v) => setSearch('employees', v)}
                enableCreate={canCreateEmployee}
                createLabel="Adicionar funcionário"
                onCreate={handleOpenCreateEmployee}
              />
            )}
            {(!isOutFlow || paidTo === 'client') && (
              <AutocompleteInput
                label={isOutFlow ? 'Cliente' : 'Cliente (opcional)'}
                name="clientId"
                control={control}
                options={options.clients ?? []}
                onInputChange={(v) => setSearch('clients', v)}
                enableCreate={canCreateClient}
                createLabel="Adicionar cliente"
                onCreate={handleOpenCreateClient}
              />
            )}
            {isOutFlow && paidTo === 'other' && (
              <AutocompleteInput
                label="Favorecido"
                name="payeeId"
                control={control}
                options={options.financePayees ?? []}
                onInputChange={(v) => setSearch('financePayees', v)}
                enableCreate={canCreateFinancialField}
                createLabel="Adicionar favorecido"
                onCreate={handleCreateFinancePayee}
              />
            )}
            <AutocompleteInput
              label="Centro de Custo"
              name="typeId"
              control={control}
              options={options.financeTypes ?? []}
              onInputChange={(v) => setSearch('financeTypes', v)}
              enableCreate={canCreateFinancialField}
              createLabel="Adicionar centro de custo"
              onCreate={handleCreateFinanceType}
            />
            <AutocompleteInput
              label="Segmento"
              name="segmentId"
              control={control}
              options={options.financeSegments ?? []}
              onInputChange={(v) => setSearch('financeSegments', v)}
              enableCreate={canCreateFinancialField}
              createLabel="Adicionar segmento"
              onCreate={handleCreateFinanceSegment}
            />
            <AutocompleteInput
              label="Categoria"
              name="categoryId"
              control={control}
              options={options.financeCategories ?? []}
              onInputChange={(v) => setSearch('financeCategories', v)}
              enableCreate={canCreateFinancialField}
              createLabel="Adicionar categoria"
              onCreate={handleCreateFinanceCategory}
            />

            <AutocompleteInput
              label="Banco"
              name="bankId"
              control={control}
              options={options.financeBanks ?? []}
              onInputChange={(v) => setSearch('financeBanks', v)}
              enableCreate={canCreateFinancialField}
              createLabel="Adicionar banco"
              onCreate={handleCreateFinanceBank}
            />
            <AutocompleteInput
              label="Método de Pagamento"
              name="methodId"
              control={control}
              options={options.financePaymentMethods ?? []}
              onInputChange={(v) => setSearch('financePaymentMethods', v)}
              enableCreate={canCreateFinancialField}
              createLabel="Adicionar método de pagamento"
              onCreate={handleCreateFinancePaymentMethod}
            />
            {showResponsibleSelect && (
              <AutocompleteInput
                label="Responsável"
                name="responsibleId"
                control={control}
                options={options.users ?? []}
                onInputChange={(v) => setSearch('users', v)}
                enableCreate={canCreateUser}
                createLabel="Adicionar responsável"
                onCreate={handleOpenCreateResponsible}
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
      <ClientDrawer
        open={clientDrawerOpen}
        onClose={handleCloseClientDrawer}
        client={null}
        initialName={clientInitialName}
        onCreated={handleClientCreated}
      />
      <UserDrawer
        open={responsibleDrawerOpen}
        onClose={handleCloseResponsibleDrawer}
        user={null}
        initialName={responsibleInitialName}
        onCreated={handleResponsibleCreated}
      />
      <EmployeeDrawer
        open={employeeDrawerOpen}
        onClose={handleCloseEmployeeDrawer}
        employee={null}
        initialName={employeeInitialName}
        onCreated={handleEmployeeCreated}
      />
    </>
  );
};
