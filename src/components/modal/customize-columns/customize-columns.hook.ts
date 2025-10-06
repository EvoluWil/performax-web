"use client";

import { useState } from "react";
import { CustomizeColumnsModalProps } from "./customize-columns.modal";

export const useCustomizeColumns = ({
  onSuccess,
  open,
  onClose,
  columns,
  tableKey,
  defaultColumns,
}: CustomizeColumnsModalProps) => {
  const [selectedColumns, setSelectedColumns] = useState<string[]>(() => {
    const stored = localStorage.getItem(tableKey);
    return stored ? JSON.parse(stored) : defaultColumns;
  });

  const toggleColumn = (column: string) => {
    let tempColumns: string[] = [];
    if (selectedColumns.includes(column)) {
      tempColumns = selectedColumns.filter((col) => col !== column);
    } else {
      tempColumns = [...selectedColumns, column];
    }
    setSelectedColumns(tempColumns);
    localStorage.setItem(tableKey, JSON.stringify(tempColumns));
    onSuccess(tempColumns);
  };

  const isColumnSelected = (column: string) => {
    return selectedColumns.includes(column);
  };

  const handleClose = () => {
    onClose();
  };

  return {
    columns,
    handleClose,
    open,
    toggleColumn,
    isColumnSelected,
  };
};
