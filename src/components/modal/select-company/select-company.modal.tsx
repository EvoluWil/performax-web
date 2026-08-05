import { Loading } from '@/components/common/loading/loading';
import { AutocompleteInput } from '@/components/inputs';
import { CloseOutlined } from '@mui/icons-material';
import { Button, Typography } from '@mui/material';
import {
  CloseButtonStyled,
  ModalContainer,
  ModalStyled,
} from '../modal-base.styles';
import { useSelectCompany } from './select-company.hook';

export type SelectCompanyModalProps = {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
};

export const SelectCompanyModal: React.FC<SelectCompanyModalProps> = (
  props
) => {
  const {
    companies,
    control,
    handleClose,
    handleSelectCompany,
    open,
    loading,
  } = useSelectCompany(props);

  const body = (
    <ModalContainer>
      <CloseButtonStyled
        onClick={() => {
          handleClose();
        }}
      >
        <CloseOutlined />
      </CloseButtonStyled>
      <Typography variant="h6" component="h2">
        Selecionar empresa
      </Typography>
      <Typography variant="body2" mt={-2} mb={2}>
        Selecione uma empresa para iniciar
      </Typography>

      {loading ? (
        <Loading message="Carregando empresas..." />
      ) : (
        <>
          {companies?.length ? (
            <AutocompleteInput
              control={control}
              name="companyId"
              label="Selecione a empresa"
              options={companies.map((company) => ({
                label: company.name,
                value: company.id,
              }))}
            />
          ) : (
            <Typography variant="body2" color="error">
              Nenhuma empresa disponível.
            </Typography>
          )}
        </>
      )}

      <Button
        onClick={handleSelectCompany}
        variant="contained"
        color="primary"
        fullWidth
      >
        Confirmar
      </Button>
      <Button onClick={handleClose} variant="outlined" color="error" fullWidth>
        Cancelar
      </Button>
    </ModalContainer>
  );

  return (
    <>
      <ModalStyled open={open} onClose={handleClose}>
        {open ? body : <></>}
      </ModalStyled>
    </>
  );
};
