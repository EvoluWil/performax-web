import { useTaskMutation, useTasksQuery } from "@/features/task/hooks";
import { TaskFilterDto } from "@/features/task/schemas";
import { taskService } from "@/features/task/services";
import { getTaskQuery } from "@/features/task/services/task.service";
import { Task } from "@/features/task/types";
import { addDays } from "date-fns";
import { Filter, Query } from "nestjs-prisma-querybuilder-interface";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-toastify";
import swal from "sweetalert2";

export const useTaskList = () => {
  const {
    data: { data: tasks },
    refetch,
  } = useTasksQuery();
  const [openModal, setOpenModal] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [term, setTerm] = useState("");
  const [filter, setFilter] = useState<TaskFilterDto>({} as TaskFilterDto);
  const [viewMode, setViewMode] = useState<"table" | "list">("table");

  useState(() => {
    if (typeof window !== "undefined" && window.innerWidth <= 768) {
      setViewMode("list");
    }
  });

  const taskMutation = useTaskMutation();
  const { push } = useRouter();
  const [filteredTasks, setFilteredTasks] = useState<Task[] | null>(null);

  const handleOpenAdd = async () => {
    setOpenModal(true);
  };

  const handleCloseAdd = () => {
    setOpenModal(false);
    setSelectedTask(null);
  };

  const handleSelectTaskToEdit = (task: Task) => {
    setSelectedTask(task);
    setOpenModal(true);
  };

  const toggleShowFilter = () => {
    setShowFilter((prev) => !prev);
  };

  const handleDeleteTask = async (taskId: string) => {
    swal.fire({
      title: "Tem certeza que deseja excluir esta tarefa?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sim, excluir",
      cancelButtonText: "Cancelar",
      preConfirm: async () => {
        const result = await taskMutation.mutateAsync({
          type: "delete",
          id: taskId,
        });

        if (result) {
          toast.success("Tarefa excluída com sucesso");
        }
      },
    });
  };

  const handleReload = async () => {
    const { data } = await refetch();
    if (data) {
      toast.success("Dados atualizados com sucesso");
    }
  };

  const handleFilter = async (data: TaskFilterDto, currentTerm = term) => {
    const filterStatus: Filter = [];
    const filterTerm: Filter = [];

    setFilter(data);
    if (currentTerm) {
      const termFields: Filter = ["title", "description", "protocol"].map(
        (field) => ({
          path: field,
          operator: "contains",
          value: currentTerm,
          insensitive: true,
        })
      );
      filterTerm.push(...termFields);
    }

    if (data.open) {
      const openedStatuses: Filter = [
        "PENDING",
        "OPEN",
        "APPROVED",
        "EXPIRED",
        "EMERGENCY",
        "SCHEDULED",
        "IMPEDED",
      ].map((status) => ({
        path: "status",
        operator: "equals",
        value: status,
      }));
      filterStatus.push(...openedStatuses);
    }
    if (data.in_progress) {
      filterStatus.push({
        path: "status",
        operator: "equals",
        value: "IN_PROGRESS",
      });
    }
    if (data.closed) {
      const closedStatuses: Filter = ["CLOSED", "REJECTED"].map((status) => ({
        path: "status",
        operator: "equals",
        value: status,
      }));
      filterStatus.push(...closedStatuses);
    }

    const queryFilter: Query = {
      ...getTaskQuery,
      filter: [],
    } as any;

    if (queryFilter.filter) {
      if (filterStatus.length) {
        queryFilter.filter.push({ or: filterStatus });
      }
      if (filterTerm.length) {
        queryFilter.filter.push({ or: filterTerm });
      }

      if (data?.clientId) {
        queryFilter.filter.push({
          path: "clientId",
          value: data.clientId,
          filterGroup: "and",
        });
      }

      if (data?.typeId) {
        queryFilter.filter.push({
          path: "typeId",
          value: data.typeId,
          filterGroup: "and",
        });
      }

      if (data?.startDate) {
        queryFilter.filter.push({
          path: "date",
          operator: "gte",
          value: new Date(data.startDate),
          filterGroup: "and",
        });
      }

      if (data?.endDate) {
        queryFilter.filter.push({
          path: "date",
          operator: "lte",
          value: new Date(addDays(data.endDate, 1)),
          filterGroup: "and",
        });
      }

      if (data.title) {
        queryFilter.filter.push({
          path: "title",
          operator: "contains",
          value: data.title,
          insensitive: true,
          filterGroup: "and",
        });
      }

      if (data.protocol) {
        queryFilter.filter.push({
          path: "protocol",
          operator: "contains",
          value: data.protocol,
          insensitive: true,
          filterGroup: "and",
        });
      }

      if (data?.userId) {
        queryFilter.filter.push({
          path: "responsibleId",
          value: data.userId,
          filterGroup: "and",
        });
      }
    }

    try {
      const result = await taskService.get(queryFilter as any);
      if (result && result.data) {
        setFilteredTasks(result.data || []);
      }
      setShowFilter(false);
    } catch (_err) {
      console.error(_err);
      toast.error("Erro ao aplicar filtros");
    }
  };

  const handleRowClick = (row: Task) => {
    push(`/panel/tasks/${row.id}`);
  };

  const handleSearch = async (search: string) => {
    setTerm(search);
    await handleFilter(filter, search);
  };

  const filteredTasksLocal = (
    filteredTasks?.length ? filteredTasks : tasks
  )?.filter(
    (task) =>
      task.title?.toLowerCase().includes(term.toLowerCase()) ||
      task.description?.toLowerCase().includes(term.toLowerCase()) ||
      task.protocol?.toLowerCase().includes(term.toLowerCase())
  );

  return {
    tasks: filteredTasksLocal,
    viewMode,
    toggleView: () => setViewMode((v) => (v === "table" ? "list" : "table")),
    openModal,
    selectedTask,
    handleOpenAdd,
    handleReload,
    handleSearch,
    handleCloseAdd,
    handleDeleteTask,
    handleSelectTaskToEdit,
    showFilter,
    toggleShowFilter,
    handleFilter,
    handleRowClick,
  };
};
