import { BaseDrawer } from '@/components/drawer';
import {
  DateTimeInput,
  FileInput,
  SelectInput,
  TextInput,
} from '@/components/inputs';
import { Occurrence } from '@/features/occurrence/types';
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from '@mui/material';
import { useOccurrenceDrawer } from './occurrence.hook';

export type OccurrenceDrawerProps = {
  open: boolean;
  onClose: () => void;
  occurrence: Occurrence | null;
  onSuccess?: () => void;
};

export const OccurrenceDrawer: React.FC<OccurrenceDrawerProps> = (props) => {
  const {
    control,
    handleOccurrence,
    loading,
    handleClose,
    open,
    options,
    defaultFiles,
    editing,
    handleRemoveDefaultFile,
    companyOptions,
    selectedCompanyId,
    setSelectedCompanyId,
  } = useOccurrenceDrawer(props);

  return (
    <BaseDrawer
      open={open}
      setOpen={handleClose}
      height="auto"
      title={editing ? 'Editar ocorrência' : 'Nova ocorrência'}
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
            placeholder="Digite o título"
            control={control}
          />

          <TextInput
            label="Descrição"
            name="description"
            placeholder="Descreva a ocorrência"
            control={control}
            multiline
            minRows={3}
          />

          <TextInput
            label="Observação"
            name="observation"
            placeholder="Digite observações"
            control={control}
            multiline
            minRows={3}
          />

          <DateTimeInput
            label="Data da ocorrência"
            name="date"
            control={control}
          />

          <SelectInput
            label="Cliente"
            name="clientId"
            control={control}
            options={options.clients || []}
          />

          <SelectInput
            label="Tipo de ocorrência"
            name="typeId"
            control={control}
            options={options.types || []}
          />

          <SelectInput
            label="Responsável"
            name="responsibleId"
            control={control}
            options={options.users || []}
          />

          <FileInput
            label="Adicionar documentos"
            name="documents"
            control={control}
            multiple
            defaultFiles={defaultFiles}
            onRemoveDefaultFile={handleRemoveDefaultFile}
          />

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
              onClick={handleOccurrence}
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
  );
};
