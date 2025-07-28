'use client';

import { ListItemIcon, MenuItem, useMediaQuery } from '@mui/material';
import {
  MRT_ColumnDef,
  MaterialReactTable,
  useMaterialReactTable,
} from 'material-react-table';
import { JSX } from 'react';
import { Empty } from '..';

export type Actions<T> = {
  icon: (data: T) => JSX.Element;
  label: (data: T) => string;
  onClick: (data: T) => void;
  condition?: (data: T) => boolean;
};

type TableProps<T> = {
  columns: MRT_ColumnDef<T | any>[];
  data: T[];
  emptyMessage?: string;
  onReload?: () => Promise<void>;
  actions?: Array<Actions<T>>;
  onRowClick?: (row: T) => void;
};

export const Table: <T>(props: TableProps<T>) => JSX.Element = ({
  columns,
  data,
  onReload,
  emptyMessage,
  actions,
  onRowClick = () => null,
}) => {
  const matches = useMediaQuery('(min-width:600px)');

  const table = useMaterialReactTable({
    columns,
    data,
    enablePagination: true,
    enableTopToolbar: false,
    enableColumnActions: false,
    enableRowActions: !!actions?.length,
    enableRowNumbers: true,
    muiPaginationProps: {
      rowsPerPageOptions: [30, 50, 100],
    },
    muiTableHeadCellProps: {
      sx: {
        backgroundColor: 'primary.main',
        '*': {
          color: 'white !important',
        },
      },
    },
    muiBottomToolbarProps: {
      sx: {
        backgroundColor: 'primary.main',
        color: 'white',
        '*': {
          color: 'white !important',
        },
      },
    },
    muiTableBodyRowProps: ({ staticRowIndex }) => ({
      onClick: () => {
        onRowClick(data[staticRowIndex as number]);
      },
      sx: {
        cursor: 'pointer',
        '&:hover': {
          backgroundColor: 'primary.light',
        },
      },
    }),
    localization: {
      sortByColumnAsc: 'Ordenar por esta coluna de forma ascendente',
      sortByColumnDesc: 'Ordenar por esta coluna de forma descendente',
      sortedByColumnAsc: 'Ordenado por esta coluna de forma ascendente',
      sortedByColumnDesc: 'Ordenado por esta coluna de forma descendente',
      rowsPerPage: matches ? 'Linhas por página' : '',
      goToNextPage: 'Ir para a próxima página',
      goToPreviousPage: 'Ir para a página anterior',
      actions: 'Ações',
    },
    initialState: {
      pagination: {
        pageSize: 30,
        pageIndex: 0,
      },
      columnPinning: {
        right: ['mrt-row-actions'],
      },
    },
    renderRowActionMenuItems: ({ closeMenu, staticRowIndex }) =>
      actions
        ?.filter((action) =>
          action?.condition
            ? action.condition(data[staticRowIndex as number])
            : true,
        )
        ?.map((action) => (
          <MenuItem
            key={action.label(data[staticRowIndex as number])}
            onClick={() => {
              action.onClick(data[staticRowIndex as number]);
              closeMenu();
            }}
            sx={{ m: 0 }}
          >
            <ListItemIcon>
              {action.icon(data[staticRowIndex as number])}
            </ListItemIcon>
            {action.label(data[staticRowIndex as number])}
          </MenuItem>
        )) || [],
  });

  if (!data.length && onReload) {
    return <Empty message={emptyMessage} onReload={onReload} />;
  }

  return <MaterialReactTable table={table} />;
};
