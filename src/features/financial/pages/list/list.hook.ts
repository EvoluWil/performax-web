import { Pagination } from '@/components/common/table/table';
import { useListUrlEffects, useListUrlState } from '@/hooks/common/use-list-url-state';
import { companyService } from '@/services/company.service';
import { useMediaQuery } from '@mui/material';
import { Query } from 'nestjs-prisma-querybuilder-interface';
import { useRouter } from 'next/navigation';
import { mergePaginationChange } from '@/utils/list-url-state';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import swal from 'sweetalert2';
import { useFinancesQuery } from '../../hooks/queries/finances.query';
import {
  useWalletQuery,
  useWalletRecalculateMutation,
  useWalletUpdateMutation,
} from '../../hooks/queries/wallet.query';
import {
  FinanceFilterDto,
  makeFinanceFilterInitialValues,
} from '../../schemas/finance-filter.schema';
import {
  toFinanceFilterDateFrom,
  toFinanceFilterDateTo,
} from '@/utils/date';
import { buildTextSearchOrFilter } from '@/utils/query';
import type { Filter } from 'nestjs-prisma-querybuilder-interface';
import {
  hasActiveFilterParams,
  parseFinanceFilterFromUrl,
  serializeFinanceFilterToUrl,
} from '@/utils/list-url-serializers';
import {
  financeService,
  getFinanceQuery,
} from '../../services/finance.service';
import type { Finance } from '../../types/finance';
import { isFinanceCancelled } from '../../types/finance';

const DEFAULT_TABLE_COLUMNS_KEY = '@performax:default-columns-finances';

export const defaultColumns = [
  'protocol',
  'title',
  'flow',
  'value',
  'date',
  'bank',
  'category',
  'status',
];

const pushInToAnd = (
  and: Filter,
  path: string,
  values: string[] | undefined,
) => {
  if (!values?.length) return;
  and.push({
    path,
    operator: 'in',
    value: values.join(';'),
  } as Filter[number]);
};

const buildQuery = (
  filterData: FinanceFilterDto | null,
  searchTerm: string,
): Query => {
  const and: Filter = [];

  const searchOrItems = searchTerm
    ? buildTextSearchOrFilter(searchTerm, ['title', 'description', 'protocol'], {
        withClientName: true,
      })
    : [];

  const flowOrItems =
    filterData?.flows && filterData.flows.length > 0
      ? filterData.flows.map((flow) => ({
          path: 'flow',
          operator: 'equals' as const,
          value: flow,
        }))
      : [];

  if (searchOrItems.length) {
    and.push({ or: searchOrItems } as Filter[number]);
  }
  if (flowOrItems.length) {
    and.push({ or: flowOrItems } as Filter[number]);
  }

  if (filterData?.flow && !filterData.flows?.length) {
    and.push({ path: 'flow', value: filterData.flow } as Filter[number]);
  }

  if (filterData?.statuses?.length) {
    and.push({
      or: filterData.statuses.map((status) => ({
        path: 'status',
        operator: 'equals' as const,
        value: status,
      })),
    } as Filter[number]);
  } else if (filterData?.status) {
    and.push({
      path: 'status',
      value: filterData.status,
    } as Filter[number]);
  }

  pushInToAnd(and, 'clientId', filterData?.clientIds);
  pushInToAnd(and, 'typeId', filterData?.typeIds);
  pushInToAnd(and, 'bankId', filterData?.bankIds);
  pushInToAnd(and, 'categoryId', filterData?.categoryIds);
  pushInToAnd(and, 'segmentId', filterData?.segmentIds);
  pushInToAnd(and, 'payeeId', filterData?.payeeIds);

  if (filterData?.dateFrom) {
    and.push({
      path: 'date',
      operator: 'gte',
      value: toFinanceFilterDateFrom(filterData.dateFrom),
    } as Filter[number]);
  }

  if (filterData?.dateTo) {
    and.push({
      path: 'date',
      operator: 'lte',
      value: toFinanceFilterDateTo(filterData.dateTo),
    } as Filter[number]);
  }

  return {
    ...getFinanceQuery,
    filter: and.length ? [{ and }] : undefined,
  } as Query;
};

export const useFinanceList = () => {
  const {
    q: urlQ,
    pagination: urlPagination,
    filter: urlFilter,
    hasUrlParams,
    syncUrl,
  } = useListUrlState({
    defaultFilter: makeFinanceFilterInitialValues(),
    parseFilter: parseFinanceFilterFromUrl,
    serializeFilter: serializeFinanceFilterToUrl,
  });

  const [pagination, setPagination] = useState(urlPagination);
  const [isChangingPage, setIsChangingPage] = useState(false);
  const [term, setTerm] = useState(urlQ);
  const [showFilter, setShowFilter] = useState(false);
  const [filter, setFilter] = useState<FinanceFilterDto>(urlFilter);
  const [openModal, setOpenModal] = useState(false);
  const [selectedFinance, setSelectedFinance] = useState<Finance | null>(null);
  const [openTransferModal, setOpenTransferModal] = useState(false);
  const [openWalletEditModal, setOpenWalletEditModal] = useState(false);
  const [currentQuery, setCurrentQuery] = useState<Query>(() =>
    buildQuery(urlFilter, urlQ),
  );
  const [viewMode, setViewMode] = useState<'table' | 'list'>('table');
  const [openCustomizeColumnsModal, setOpenCustomizeColumnsModal] =
    useState(false);
  const [selectedColumnsKeys, setSelectedColumnsKeys] =
    useState<string[]>(defaultColumns);

  const isSmallScreen = useMediaQuery((theme: any) =>
    theme.breakpoints.down('md'),
  );

  const defaultCompany = companyService.getDefaultCompany();
  const currentCompanyId = defaultCompany?.id ?? '';
  const groupId = defaultCompany?.groupId ?? '';

  const financesQuery = useMemo(
    () => ({
      ...currentQuery,
      limit: pagination.pageSize,
    }),
    [currentQuery, pagination.pageSize],
  );

  const {
    data,
    refetch,
    isPending,
    isFetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useFinancesQuery(financesQuery);

  const { data: wallet } = useWalletQuery();
  const walletRecalculateMutation = useWalletRecalculateMutation();
  const walletUpdateMutation = useWalletUpdateMutation();

  const finances = data?.finances ?? [];
  const count = data?.count ?? 0;

  const paginatedFinances = finances.slice(
    pagination.pageIndex * pagination.pageSize,
    (pagination.pageIndex + 1) * pagination.pageSize,
  );

  const { push } = useRouter();

  const handleReload = async () => {
    const { data: reloadedData } = await refetch();
    if (reloadedData) toast.success('Dados atualizados com sucesso');
  };

  const handleRowClick = (row: Finance) => {
    push(`/panel/financial/${row.id}`);
  };

  const handleOpenAdd = () => setOpenModal(true);
  const handleCloseAdd = () => {
    setOpenModal(false);
    setSelectedFinance(null);
  };

  const handleSelectFinanceToEdit = async (row: Finance) => {
    if (isFinanceCancelled(row.status)) {
      toast.info('Lançamentos cancelados não podem ser editados.');
      return;
    }
    try {
      const full = await financeService.getById(row.id);
      setSelectedFinance(full);
    } catch {
      setSelectedFinance(row);
    }
    setOpenModal(true);
  };

  const handleDeleteFinance = async (id: string) => {
    swal.fire({
      title: 'Tem certeza que deseja excluir este lançamento?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sim, excluir',
      cancelButtonText: 'Cancelar',
      preConfirm: async () => {
        const result = await financeService.delete(id);
        if (result) {
          toast.success('Lançamento excluído com sucesso');
          await refetch();
        }
      },
    });
  };

  const toggleShowFilter = () => setShowFilter((prev) => !prev);

  const toggleView = () =>
    setViewMode((v) => (v === 'table' ? 'list' : 'table'));

  const toggleCustomizeColumnsModal = () =>
    setOpenCustomizeColumnsModal((prev) => !prev);

  const handleUpdateColumns = (cols: string[]) => setSelectedColumnsKeys(cols);

  const handleSearch = (search: string) => {
    setTerm(search);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    setCurrentQuery(buildQuery(filter, search));
  };

  const handleFilter = (data: FinanceFilterDto) => {
    setFilter(data);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    setCurrentQuery(buildQuery(data, term));
  };

  const handlePaginationChange = async (newPagination: Pagination) => {
    const merged = mergePaginationChange(pagination, newPagination);
    if (!merged) return;

    if (newPagination.pageIndex === pagination.pageIndex) {
      setPagination(merged);
      return;
    }

    const requiredCount = (merged.pageIndex + 1) * merged.pageSize;

    setPagination(merged);

    if (finances.length < requiredCount && hasNextPage && !isFetchingNextPage) {
      setIsChangingPage(true);
      try {
        await fetchNextPage();
      } finally {
        setIsChangingPage(false);
      }
    }
  };

  const handleRecalculate = async () => {
    try {
      await walletRecalculateMutation.mutateAsync();
      toast.success('Carteira recalculada com sucesso');
    } catch {
      toast.error('Erro ao recalcular carteira');
    }
  };

  const handleWalletUpdate = async (initialValue: number) => {
    if (!wallet?.id) return;
    try {
      await walletUpdateMutation.mutateAsync({
        walletId: wallet.id,
        initialValue,
      });
      toast.success('Valor inicial da carteira atualizado');
      setOpenWalletEditModal(false);
    } catch {
      toast.error('Erro ao atualizar carteira');
    }
  };

  const getFinanceReportData = async () => {
    try {
      const result = await financeService.get({
        ...buildQuery(filter, term),
        limit: 500,
        page: 1,
      } as any);
      return {
        finances: result?.data || [],
        total: result?.count ?? 0,
        limit: 500,
      };
    } catch {
      return { finances: [] as Finance[], total: 0, limit: 500 };
    }
  };

  useEffect(() => {
    if (isSmallScreen && viewMode !== 'list') setViewMode('list');
  }, [isSmallScreen, viewMode]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(DEFAULT_TABLE_COLUMNS_KEY);
      if (stored) setSelectedColumnsKeys(JSON.parse(stored));
    }
  }, []);

  useListUrlEffects({
    hasUrlParams,
    urlState: { q: urlQ, pagination: urlPagination, filter: urlFilter },
    state: { q: term, pagination, filter },
    syncUrl,
    onApplyFromUrl: async (nextFilter, nextTerm) => {
      if (
        hasActiveFilterParams(serializeFinanceFilterToUrl(nextFilter), nextTerm)
      ) {
        setFilter(nextFilter);
        setCurrentQuery(buildQuery(nextFilter, nextTerm));
      }
    },
  });

  return {
    finances: paginatedFinances,
    term,
    filter,
    count,
    handleReload,
    handleSearch,
    handleRowClick,
    handleOpenAdd,
    handleCloseAdd,
    handleSelectFinanceToEdit,
    handleDeleteFinance,
    toggleShowFilter,
    handleFilter,
    handleRecalculate,
    openModal,
    selectedFinance,
    showFilter,
    loading: isPending || isFetching || isChangingPage,
    wallet,
    walletRecalculating: walletRecalculateMutation.isPending,
    walletUpdating: walletUpdateMutation.isPending,
    openWalletEditModal,
    setOpenWalletEditModal,
    handleWalletUpdate,
    openTransferModal,
    setOpenTransferModal,
    pagination,
    handlePaginationChange,
    currentCompanyId,
    groupId,
    viewMode,
    toggleView,
    openCustomizeColumnsModal,
    toggleCustomizeColumnsModal,
    selectedColumnsKeys,
    handleUpdateColumns,
    tableKey: DEFAULT_TABLE_COLUMNS_KEY,
    getFinanceReportData,
  };
};
