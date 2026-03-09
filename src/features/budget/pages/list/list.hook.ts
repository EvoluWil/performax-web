import { Pagination } from '@/components/common/table/table';
import { useCompanyPermissions } from '@/hooks/common/permission';
import { applyScopedFilter } from '@/utils/query';
import { useMediaQuery } from '@mui/material';
import { Filter, Query } from 'nestjs-prisma-querybuilder-interface';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import swal from 'sweetalert2';
import { useBudgetsQuery } from '../../hooks/queries/budgets.query';
import { BudgetFilterDto } from '../../schemas/budget-filter.schema';
import { budgetService, getBudgetQuery } from '../../services/budget.service';
import { Budget } from '../../types/budget';

const defaultColumns = [
  'protocol',
  'title',
  'client',
  'responsible',
  'value',
  'status',
];

const DEFAULT_TABLE_COLUMNS_KEY = '@performax:default-columns-budgets';

export const useBudgetList = () => {
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 30 });
  const [filteredCount, setFilteredCount] = useState(0);

  const {
    data,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isRefetching,
    isPending,
    isLoading,
    isFetching,
  } = useBudgetsQuery({ pageSize: pagination.pageSize });

  const budgets = data?.budgets ?? [];

  const [term, setTerm] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const [filter, setFilter] = useState<BudgetFilterDto | null>(null);
  const [selectedColumnsKeys, setSelectedColumnsKeys] =
    useState<string[]>(defaultColumns);
  const [openCustomizeColumnsModal, setOpenCustomizeColumnsModal] =
    useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'list'>('table');
  const [filteredBudgets, setFilteredBudgets] = useState<Budget[] | null>(null);
  const [openModal, setOpenModal] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);

  const { getScopedUserIds, userId } = useCompanyPermissions();

  const scopedBudgetUserIds = useMemo(
    () => getScopedUserIds('budget'),
    [getScopedUserIds],
  );

  const hasBudgetAccess =
    scopedBudgetUserIds === null || scopedBudgetUserIds.length > 0;

  const isSmallScreen = useMediaQuery((theme) => theme.breakpoints.down('md'));
  const { push } = useRouter();

  const handleReload = async () => {
    if (!hasBudgetAccess) {
      toast.info('Você não possui permissão para visualizar orçamentos.');
      return;
    }

    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    const { data: reloadedData } = await refetch();
    if (reloadedData) toast.success('Dados atualizados com sucesso');
  };

  const handleRowClick = (row: Budget) => {
    push(`/panel/budgets/${row.id}`);
  };

  const handleOpenAdd = async () => setOpenModal(true);

  const handleCloseAdd = () => {
    setOpenModal(false);
    setSelectedBudget(null);
  };

  const handleSelectBudgetToEdit = (row: Budget) => {
    setSelectedBudget(row);
    setOpenModal(true);
  };

  const handleDeleteBudget = async (id: string) => {
    swal.fire({
      title: 'Tem certeza que deseja excluir este orçamento?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sim, excluir',
      cancelButtonText: 'Cancelar',
      preConfirm: async () => {
        const result = await budgetService.delete(id);
        if (result) {
          toast.success('Orçamento excluído com sucesso');
          await refetch();
        }
      },
    });
  };

  const toggleShowFilter = () => setShowFilter((prev) => !prev);
  const toggleCustomizeColumnsModal = () =>
    setOpenCustomizeColumnsModal((prev) => !prev);

  const handleFilter = async (
    data: BudgetFilterDto,
    currentTerm = term,
    page = 1,
  ) => {
    setFilter(Object.keys(data)?.length ? data : null);
    const statusFilter: Filter = [];
    const termFilter: Filter = [];

    if (currentTerm) {
      const termFields: Filter = ['title', 'description', 'protocol'].map(
        (field) => ({
          path: field,
          operator: 'contains',
          value: currentTerm,
          insensitive: true,
        }),
      );
      termFilter.push(...termFields);
    }

    // status toggles
    const selectedStatuses: string[] = [];
    if (data.pending) selectedStatuses.push('PENDING', 'APPROVED');
    if (data.financial) selectedStatuses.push('CHARGED', 'PAID', 'FINANCIAL');
    if (data.closed) selectedStatuses.push('COMPLETED', 'REJECTED');
    if (selectedStatuses.length) {
      const statusesOr: Filter = selectedStatuses.map(
        (s) =>
          ({
            path: 'status',
            operator: 'equals',
            value: s,
          }) as any,
      );
      statusFilter.push(...statusesOr);
    }

    const queryFilter: Query = {
      ...getBudgetQuery,
      filter: [],
    } as any;

    if (queryFilter.filter) {
      if (statusFilter.length) {
        queryFilter.filter.push({ or: statusFilter });
      }
      if (termFilter.length) {
        queryFilter.filter.push({ or: termFilter });
      }

      if (data?.clientId) {
        queryFilter.filter.push({
          path: 'clientId',
          value: data.clientId,
          filterGroup: 'and',
        });
      }

      if (data?.typeId) {
        queryFilter.filter.push({
          path: 'typeId',
          value: data.typeId,
          filterGroup: 'and',
        });
      }

      if (data?.startDate) {
        queryFilter.filter.push({
          path: 'createdAt',
          operator: 'gte',
          value: new Date(data.startDate),
          filterGroup: 'and',
        });
      }

      if (data?.endDate) {
        queryFilter.filter.push({
          path: 'createdAt',
          operator: 'lte',
          value: new Date(data.endDate),
          filterGroup: 'and',
        });
      }

      if (data.title) {
        queryFilter.filter.push({
          path: 'title',
          operator: 'contains',
          value: data.title,
          insensitive: true,
          filterGroup: 'and',
        });
      }

      if (data.protocol) {
        queryFilter.filter.push({
          path: 'protocol',
          operator: 'contains',
          value: data.protocol,
          insensitive: true,
          filterGroup: 'and',
        });
      }

      if (data?.userId) {
        queryFilter.filter.push({
          path: 'responsibleId',
          value: data.userId,
          filterGroup: 'and',
        });
      }
    }

    if (!hasBudgetAccess) {
      setFilteredBudgets([]);
      setShowFilter(false);
      return;
    }

    try {
      const scopedQuery = applyScopedFilter(
        queryFilter as Query,
        scopedBudgetUserIds,
        userId,
        {
          field: 'responsibleId',
          operator: 'in',
        },
      );

      if (!scopedQuery) {
        setFilteredBudgets([]);
        setShowFilter(false);
        return;
      }

      const result = await budgetService.get({
        ...scopedQuery,
        limit: pagination.pageSize,
        page,
      } as any);
      setFilteredBudgets(result?.data || []);
      setFilteredCount(result?.count ?? 0);
      setShowFilter(false);
    } catch (e) {
      console.error(e);
      toast.error('Erro ao aplicar filtros');
    }
  };

  const handleSearch = async (search: string) => {
    setTerm(search);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    await handleFilter(filter || ({} as BudgetFilterDto), search, 1);
  };

  const toggleView = () =>
    setViewMode((v) => (v === 'table' ? 'list' : 'table'));

  useEffect(() => {
    if (isSmallScreen && viewMode !== 'list') setViewMode('list');
  }, [isSmallScreen, viewMode]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(DEFAULT_TABLE_COLUMNS_KEY);
      if (stored) setSelectedColumnsKeys(JSON.parse(stored));
    }
  }, []);

  const loading = isPending || isRefetching || isLoading || isFetching;

  const count = filter ? filteredCount : (data?.count ?? 0);

  const currentBudgetsAll = (
    hasBudgetAccess ? (filter ? filteredBudgets || [] : budgets) : []
  ).filter(
    (b) =>
      b.title?.toLowerCase().includes(term.toLowerCase()) ||
      b.description?.toLowerCase().includes(term.toLowerCase()) ||
      b.protocol?.toLowerCase().includes(term.toLowerCase()),
  );

  // Filter active: filteredBudgets is already the server page, no slice needed.
  // No filter: budgets is accumulated; slice for current page.
  const paginatedBudgets = filter
    ? currentBudgetsAll
    : currentBudgetsAll.slice(
        pagination.pageIndex * pagination.pageSize,
        (pagination.pageIndex + 1) * pagination.pageSize,
      );

  const handlePaginationChange = async (newPagination: Pagination) => {
    if (JSON.stringify(newPagination) === JSON.stringify(pagination)) return;

    if (newPagination.pageIndex === pagination.pageIndex) {
      setPagination((prev) => ({ ...prev, pageSize: newPagination.pageSize }));
      return;
    }

    setPagination(newPagination);

    if (filter) {
      await handleFilter(filter, term, newPagination.pageIndex + 1);
    } else {
      const requiredCount =
        (newPagination.pageIndex + 1) * newPagination.pageSize;
      if (
        budgets.length < requiredCount &&
        hasNextPage &&
        !isFetchingNextPage
      ) {
        await fetchNextPage();
      }
    }
  };

  return {
    budgets: paginatedBudgets,
    count,
    pagination,
    handlePaginationChange,
    viewMode,
    toggleView,
    loading,
    handleReload,
    handleSearch,
    handleRowClick,
    showFilter,
    toggleShowFilter,
    handleFilter,
    openModal,
    selectedBudget,
    handleOpenAdd,
    handleCloseAdd,
    handleSelectBudgetToEdit,
    handleDeleteBudget,
    selectedColumnsKeys,
    handleUpdateColumns: (cols: string[]) => setSelectedColumnsKeys(cols),
    defaultColumns,
    tableKey: DEFAULT_TABLE_COLUMNS_KEY,
    toggleCustomizeColumnsModal,
    openCustomizeColumnsModal,
  };
};
