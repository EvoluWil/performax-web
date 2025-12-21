"use client";

import { ListHeader, Table } from "@/components/common";
import { Actions } from "@/components/common/table/table";
import { TaskTypeDrawer } from "@/features/task/components";
import { TaskType } from "@/features/task/types";
import { useCompanyPermissions } from "@/hooks/common/permission";
import { DeleteOutlined } from "@mui/icons-material";
import { Typography } from "@mui/material";
import { MRT_ColumnDef } from "material-react-table";
import { useTaskTypeList } from "./type-list.hook";

const columns: MRT_ColumnDef<TaskType>[] = [
  {
    accessorKey: "name",
    header: "Nome",
  },
];

export const TaskTypeList = () => {
  const {
    taskTypes,
    openModal,
    selectedTaskType,
    handleOpenAdd,
    handleReload,
    handleSearch,
    handleCloseAdd,
    handleDeleteTaskType,
    handleSelectTaskTypeToEdit,
  } = useTaskTypeList();
  const { hasPermission, isReady: permissionsReady } = useCompanyPermissions();
  const canWrite = permissionsReady && hasPermission("task", "write");
  const canAdmin = permissionsReady && hasPermission("task", "admin");
  const canEdit = canWrite || canAdmin;

  const actions: Actions<TaskType>[] = [];

  if (canAdmin) {
    actions.push({
      icon: () => <DeleteOutlined />,
      label: () => "Excluir tipo de tarefa",
      onClick: (taskType) => handleDeleteTaskType(taskType.id),
    });
  }

  return (
    <>
      <Typography variant="h5" gutterBottom color="primary" fontWeight="bold">
        TIPOS DE TAREFA
      </Typography>

      <ListHeader
        onAdd={canEdit ? handleOpenAdd : undefined}
        onReload={handleReload}
        onSearch={handleSearch}
        searchTitle="Pesquise por nome"
        addTitle="Adicionar tipo de tarefa"
      />
      <br />
      <Table
        columns={columns}
        data={taskTypes}
        emptyMessage="Nenhum resultado encontrado"
        onReload={handleReload}
        onRowClick={canEdit ? handleSelectTaskTypeToEdit : () => null}
        actions={actions}
      />

      {openModal && (
        <TaskTypeDrawer
          taskType={selectedTaskType}
          open={openModal}
          onClose={handleCloseAdd}
        />
      )}
    </>
  );
};
