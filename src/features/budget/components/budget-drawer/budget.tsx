import { BaseDrawer } from '@/components/drawer';
import {
  AutocompleteInput,
  CurrencyInput,
  TextInput,
} from '@/components/inputs';
import { ClientDrawer } from '@/features/client/components/client-drawer/client';
import { UserDrawer } from '@/features/user/components';
import { Add, DeleteOutline } from '@mui/icons-material';
import {
  Box,
  Button,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from '@mui/material';
import { useFieldArray, useWatch } from 'react-hook-form';
import type { BudgetItemForm } from '../../schemas/budget-drawer.schema';
import { Budget } from '../../types/budget';
import { useBudgetDrawer } from './budget.hook';

export type BudgetDrawerProps = {
  open: boolean;
  onClose: () => void;
  budget: Budget | null;
  onSuccess?: () => void;
};

export const BudgetDrawer: React.FC<BudgetDrawerProps> = (props) => {
  const {
    control,
    handleBudget,
    loading,
    handleClose,
    open,
    editing,
    options,
    setSearch,
    canCreateClient,
    canCreateBudgetType,
    canCreateUser,
    handleCreateBudgetType,
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
    setValue,
    companyOptions,
    selectedCompanyId,
    setSelectedCompanyId,
  } = useBudgetDrawer(props);

  // Items editor using react-hook-form field array
  const { fields, append, remove } = useFieldArray({
    control: control as any,
    name: 'items' as any,
  });
  const items = useWatch({ control: control as any, name: 'items' as any }) as
    | BudgetItemForm[]
    | undefined;

  const total = (items || []).reduce((sum, it) => {
    const qty = Number(it?.quantity ?? 1) || 0;
    const val = Number(it?.value ?? 0) || 0;
    return sum + qty * val;
  }, 0);

  // keep computed total synced into form 'value'
  if (!Number.isNaN(total)) {
    setValue(
      'value' as any,
      total as any,
      { shouldValidate: false, shouldDirty: true } as any,
    );
  }

  return (
    <>
      <BaseDrawer
        open={open}
        setOpen={handleClose}
        height="auto"
        title={editing ? 'Editar Orçamento' : 'Novo Orçamento'}
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
            <TextInput
              label="Título"
              name="title"
              placeholder="Digite o título do orçamento"
              control={control}
            />
            <TextInput
              label="Descrição"
              name="description"
              placeholder="Descreva o orçamento"
              control={control}
              multiline
              minRows={3}
            />
            <TextInput
              label="Observações"
              name="observation"
              placeholder="Digite observações"
              control={control}
              multiline
              minRows={2}
            />
            {/* Valor é calculado automaticamente pela soma dos itens */}
            <Box width="100%">
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Itens do orçamento
              </Typography>
              <Box display="flex" flexDirection="column" gap={1}>
                {fields.map((field, index) => (
                  <Box
                    key={field.id}
                    display="grid"
                    gridTemplateColumns={{
                      xs: '1fr',
                    }}
                    gap={1}
                    alignItems="center"
                    p={2}
                    border="1px solid"
                    borderColor="grey.300"
                    borderRadius={1}
                  >
                    <TextInput
                      name={`items.${index}.label` as any}
                      control={control}
                      label="Descrição"
                    />
                    <AutocompleteInput
                      name={`items.${index}.type` as any}
                      control={control}
                      label="Tipo"
                      options={[
                        { value: 'PRODUCT', label: 'Produto' },
                        { value: 'SERVICE', label: 'Serviço' },
                      ]}
                    />
                    <TextInput
                      name={`items.${index}.quantity` as any}
                      control={control}
                      label="Qtde"
                      type="number"
                    />
                    <CurrencyInput
                      name={`items.${index}.value` as any}
                      control={control}
                      label="Valor"
                    />
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={() => remove(index)}
                    >
                      <DeleteOutline />
                    </Button>
                  </Box>
                ))}
                <Button
                  startIcon={<Add />}
                  variant="outlined"
                  onClick={() =>
                    append({
                      label: '',
                      type: 'PRODUCT',
                      quantity: 1,
                      value: '',
                    } as any)
                  }
                >
                  Adicionar item
                </Button>
              </Box>
            </Box>
            <Box width="100%" display="flex" justifyContent="flex-end">
              <Typography variant="subtitle1">
                Total: R${' '}
                {total.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </Typography>
            </Box>

            <AutocompleteInput
              label="Tipo de Orçamento"
              name="typeId"
              control={control}
              options={options.types || []}
              enableCreate={canCreateBudgetType}
              createLabel="Adicionar tipo de orçamento"
              onCreate={handleCreateBudgetType}
            />
            <AutocompleteInput
              label="Cliente"
              name="clientId"
              control={control}
              options={options.clients || []}
              onInputChange={(v) => setSearch('clients', v)}
              enableCreate={canCreateClient}
              createLabel="Adicionar cliente"
              onCreate={handleOpenCreateClient}
            />
            <AutocompleteInput
              label="Responsável"
              name="responsibleId"
              control={control}
              options={options.users || []}
              onInputChange={(v) => setSearch('users', v)}
              enableCreate={canCreateUser}
              createLabel="Adicionar responsável"
              onCreate={handleOpenCreateResponsible}
            />

            <Divider sx={{ width: '100%' }} />

            <Box
              mt="auto"
              display="flex"
              gap={2}
              justifyContent="space-between"
              width="100%"
            >
              <Button
                variant="outlined"
                color="error"
                onClick={handleClose}
                loading={loading}
                fullWidth
              >
                Cancelar
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handleBudget}
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
    </>
  );
};
