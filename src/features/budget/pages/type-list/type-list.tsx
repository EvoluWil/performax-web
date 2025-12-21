"use client";

import { ListHeader, Table } from "@/components/common";
import { Actions } from "@/components/common/table/table";
import { useCompanyPermissions } from "@/hooks/common/permission";
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
  const { hasPermission, isReady: permissionsReady } = useCompanyPermissions();
  const canWrite = permissionsReady && hasPermission("budget", "write");
  const canAdmin = permissionsReady && hasPermission("budget", "admin");
  const canEdit = canWrite || canAdmin;

  const actions: Actions<BudgetType>[] = [];

  if (canAdmin) {
    actions.push({
      icon: () => <DeleteOutlined />,
      label: () => "Excluir tipo de orçamento",
      onClick: (type) => handleDeleteBudgetType(type.id),
    });
  }

  return (
    <>
      <Typography variant="h5" gutterBottom color="primary" fontWeight="bold">
        TIPOS DE ORÇAMENTO
      </Typography>

      <ListHeader
        onAdd={canEdit ? handleOpenAdd : undefined}
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
        onRowClick={canEdit ? handleSelectBudgetTypeToEdit : () => null}
        actions={actions}
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
