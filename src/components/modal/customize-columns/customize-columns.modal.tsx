import { CloseOutlined } from '@mui/icons-material';
import { Box, Button, Divider, Switch, Typography } from '@mui/material';
import {
  CloseButtonStyled,
  ModalContainer,
  ModalStyled,
} from '../modal-base.styles';
import { useCustomizeColumns } from './customize-columns.hook';

export type CustomizeColumnItem = { key: string; label: string };

export type CustomizeColumnsModalProps = {
  open: boolean;
  onClose: () => void;
  onSuccess: (columns: string[]) => void;
  columns: CustomizeColumnItem[];
  tableKey: string;
  defaultColumns: string[];
};

export const CustomizeColumnsModal: React.FC<CustomizeColumnsModalProps> = (
  props,
) => {
  const { handleClose, open, columns, isColumnSelected, toggleColumn } =
    useCustomizeColumns(props);

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
        Personalizar colunas
      </Typography>
      <Typography variant="body2" mt={-2} mb={2}>
        Selecione as colunas que deseja visualizar na tabela.
      </Typography>

      {columns.length === 0 && (
        <Typography variant="body2" color="textSecondary">
          Nenhuma coluna disponível.
        </Typography>
      )}

      <Divider />

      <Box display="flex" flexDirection="column" gap={1}>
        {columns.map((column) => {
          const isChecked = isColumnSelected(column.key);
          return (
            <Box
              key={column.key}
              display="flex"
              alignItems="center"
              justifyContent="space-between"
            >
              <Typography variant="body2">{column.label}</Typography>
              <Switch
                checked={isChecked}
                onChange={() => toggleColumn(column.key)}
              />
            </Box>
          );
        })}
      </Box>

      <Divider />

      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
        <Button
          type="button"
          variant="contained"
          color="primary"
          onClick={handleClose}
        >
          Confirmar
        </Button>
      </Box>
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
