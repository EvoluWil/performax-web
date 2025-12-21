import { useTaskMutation, useTasksQuery } from "@/features/task/hooks";
import { TaskFilterDto } from "@/features/task/schemas";
import { taskService } from "@/features/task/services";
import { getTaskQuery } from "@/features/task/services/task.service";
import { Task } from "@/features/task/types";
import { useCompanyPermissions } from "@/hooks/common/permission";
import { applyScopedFilter } from "@/utils/query";
import { useMediaQuery } from "@mui/material";
import { addDays } from "date-fns";
import { Filter, Query } from "nestjs-prisma-querybuilder-interface";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import swal from "sweetalert2";

const defaultColumns = [
  "title",
  "client",
  "responsible",
  "type",
  "date",
  "status",
];

const DEFAULT_TABLE_COLUMNS_KEY = "@performax:default-columns-tasks";

export const useTaskList = () => {
  const {
    data: { data: tasks },
    refetch,
    isRefetching,
    isPending,
    isLoading,
    isFetching,
  } = useTasksQuery();
  const { getScopedUserIds } = useCompanyPermissions();
  const [openModal, setOpenModal] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [openCustomizeColumnsModal, setOpenCustomizeColumnsModal] =
    useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [term, setTerm] = useState("");
  const [filter, setFilter] = useState<TaskFilterDto>({} as TaskFilterDto);
  const [selectedColumnsKeys, setSelectedColumnsKeys] =
    useState<string[]>(defaultColumns);
  const isSmallScreen = useMediaQuery((theme) => theme.breakpoints.down("md"));

  const [viewMode, setViewMode] = useState<"table" | "list">("table");

  const taskMutation = useTaskMutation();
  const { push } = useRouter();
  const [filteredTasks, setFilteredTasks] = useState<Task[] | null>(null);

  const scopedTaskUserIds = useMemo(
    () => getScopedUserIds("task"),
    [getScopedUserIds]
  );

  const hasTaskAccess =
    scopedTaskUserIds === null || scopedTaskUserIds.length > 0;

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

  const toggleCustomizeColumnsModal = () => {
    setOpenCustomizeColumnsModal((prev) => !prev);
  };

  const handleUpdateColumns = (columns: string[]) => {
    setSelectedColumnsKeys(columns);
  };

  const handleReload = async () => {
    if (!hasTaskAccess) {
      toast.info("Você não possui permissão para visualizar tarefas.");
      return;
    }

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

    if (!hasTaskAccess) {
      setFilteredTasks([]);
      setShowFilter(false);
      return;
    }

    try {
      const scopedQuery = applyScopedFilter(
        queryFilter as Query,
        scopedTaskUserIds,
        {
          field: "responsibleId",
          operator: "in",
        }
      );

      if (!scopedQuery) {
        setFilteredTasks([]);
        setShowFilter(false);
        return;
      }

      const result = await taskService.get(scopedQuery as any);
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
    hasTaskAccess ? (filteredTasks?.length ? filteredTasks : tasks) : []
  )?.filter(
    (task) =>
      task.title?.toLowerCase().includes(term.toLowerCase()) ||
      task.description?.toLowerCase().includes(term.toLowerCase()) ||
      task.protocol?.toLowerCase().includes(term.toLowerCase())
  );

  const toggleView = () => {
    setViewMode((v) => (v === "table" ? "list" : "table"));
  };

  useEffect(() => {
    if (isSmallScreen && viewMode !== "list") {
      setViewMode("list");
    }
  }, [isSmallScreen, viewMode]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(DEFAULT_TABLE_COLUMNS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setSelectedColumnsKeys(parsed);
      }
    }
  }, []);

  const loading = isPending || isRefetching || isLoading || isFetching;

  return {
    tasks: filteredTasksLocal,
    viewMode,
    toggleView,
    openModal,
    selectedTask,
    loading,
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
    toggleCustomizeColumnsModal,
    openCustomizeColumnsModal,
    selectedColumnsKeys,
    handleUpdateColumns,
    defaultColumns,
    tableKey: DEFAULT_TABLE_COLUMNS_KEY,
  };
};
