"use client";

import { ListHeader, Table } from "@/components/common";
import { DeleteOutlined } from "@mui/icons-material";
import { Typography } from "@mui/material";
import { MRT_ColumnDef } from "material-react-table";
import { BudgetTypeDrawer } from "../../components/budget-type-drawer/budget-type";
import { BudgetType } from "../../types/budget-type";
import { useBudgetTypeList } from "./type-list.hook";

const columns: MRT_ColumnDef<BudgetType>[] = [
  { accessorKey: "name", header: "Nome" },
  { accessorKey: "needApprove", header: "Precisa Aprovação?" },
];

export const BudgetTypeList = () => {
  const {
    budgetTypes,
    openModal,
    selectedBudgetType,
    handleOpenAdd,
    handleReload,
    handleSearch,
    handleCloseAdd,
    handleDeleteBudgetType,
    handleSelectBudgetTypeToEdit,
  } = useBudgetTypeList();

  return (
    <>
      <Typography variant="h5" gutterBottom color="primary" fontWeight="bold">
        TIPOS DE ORÇAMENTO
      </Typography>

      <ListHeader
        onAdd={handleOpenAdd}
        onReload={handleReload}
        onSearch={handleSearch}
        searchTitle="Pesquise por nome"
        addTitle="Adicionar tipo de orçamento"
      />
      <br />
      <Table
        columns={columns}
        data={budgetTypes || []}
        emptyMessage="Nenhum resultado encontrado"
        onReload={handleReload}
        onRowClick={handleSelectBudgetTypeToEdit}
        actions={[
          {
            icon: () => <DeleteOutlined />,
            label: () => "Excluir tipo de orçamento",
            onClick: (type) => handleDeleteBudgetType(type.id),
          },
        ]}
      />

      {openModal && (
        <BudgetTypeDrawer
          budgetType={selectedBudgetType}
          open={openModal}
          onClose={handleCloseAdd}
        />
      )}
    </>
  );
};
