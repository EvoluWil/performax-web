'use client';

import { ListItemIcon, MenuItem, useMediaQuery } from '@mui/material';
import {
  MRT_ColumnDef,
  MaterialReactTable,
  useMaterialReactTable,
} from 'material-react-table';
import { MRT_Localization_PT_BR } from 'material-react-table/locales/pt-BR';
import { JSX } from 'react';
import { Empty } from '..';

export type Actions<T> = {
  icon: (data: T) => JSX.Element;
  label: (data: T) => string;
  onClick: (data: T) => void;
  condition?: (data: T) => boolean;
};

export type Pagination = {
  pageIndex: number;
  pageSize: number;
};

type TableProps<T> = {
  columns: MRT_ColumnDef<T | any>[];
  data: T[];
  emptyMessage?: string;
  onReload?: () => Promise<void>;
  actions?: Array<Actions<T>>;
  onRowClick?: (row: T) => void;
  loading?: boolean;
  pagination?: Pagination;
  onPaginationChange?: (pagination: Pagination) => void;
  rowCount?: number;
};

export const Table: <T>(props: TableProps<T>) => JSX.Element = ({
  columns,
  data,
  onReload,
  emptyMessage,
  actions,
  loading = false,
  onRowClick = () => null,
  pagination,
  onPaginationChange,
  rowCount,
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
    muiTableBodyRowProps: ({ row }) => ({
      onClick: () => {
        onRowClick(row.original);
      },
      sx: {
        cursor: 'pointer',
        '&:hover': {
          backgroundColor: 'primary.light',
        },
      },
    }),
    localization: {
      ...MRT_Localization_PT_BR,
      rowsPerPage: matches ? 'Linhas por página' : '',
    },
    manualPagination: !!pagination,
    rowCount: rowCount ?? data.length,
    state: {
      ...(pagination && { pagination }),
      isLoading: loading && !data?.length,
      showProgressBars: loading && !!data?.length,
    },
    ...(onPaginationChange && {
      onPaginationChange: (updater: any) => {
        const current = pagination ?? { pageIndex: 0, pageSize: 30 };
        const next = typeof updater === 'function' ? updater(current) : updater;
        onPaginationChange(next);
      },
    }),
    initialState: {
      pagination: {
        pageSize: 30,
        pageIndex: 0,
      },
      columnPinning: {
        right: ['mrt-row-actions'],
      },
    },
    renderRowActionMenuItems: ({ closeMenu, row }) =>
      actions
        ?.filter((action) =>
          action?.condition ? action.condition(row.original) : true,
        )
        ?.map((action) => (
          <MenuItem
            key={action.label(row.original)}
            onClick={() => {
              action.onClick(row.original);
              closeMenu();
            }}
            sx={{ m: 0 }}
          >
            <ListItemIcon>{action.icon(row.original)}</ListItemIcon>
            {action.label(row.original)}
          </MenuItem>
        )) || [],
  });

  if (!data?.length && !loading && onReload) {
    return <Empty message={emptyMessage} onReload={onReload} />;
  }

  return <MaterialReactTable table={table} />;
};
