import { Drawer, styled } from '@mui/material';

interface DrawerStyledProps {
  width: number;
}
export const DrawerStyled = styled(Drawer)<DrawerStyledProps>`
  .MuiDrawer-paper {
    width: ${({ width }) => width}vw;
    min-width: 420px;
    max-width: 560px;
    height: 100dvh;
    overflow: hidden;

    ${({ theme }) => theme.breakpoints.down('md')} {
      width: 90vw;
      min-width: 0;
      max-width: none;
    }
  }
`;
