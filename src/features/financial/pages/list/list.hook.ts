import { Pagination } from '@/components/common/table/table';
import { companyService } from '@/services/company.service';
import { useMediaQuery } from '@mui/material';
import { Query } from 'nestjs-prisma-querybuilder-interface';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import swal from 'sweetalert2';
import { useFinancesQuery } from '../../hooks/queries/finances.query';
import {
  useWalletQuery,
  useWalletRecalculateMutation,
  useWalletUpdateMutation,
} from '../../hooks/queries/wallet.query';
import { FinanceFilterDto } from '../../schemas/finance-filter.schema';
import {
  financeService,
  getFinanceQuery,
} from '../../services/finance.service';
import type { Finance } from '../../types/finance';

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

export const useFinanceList = () => {
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 30 });
  const [isChangingPage, setIsChangingPage] = useState(false);
  const [term, setTerm] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const [filter, setFilter] = useState<FinanceFilterDto | null>(null);
  const [openModal, setOpenModal] = useState(false);
  const [selectedFinance, setSelectedFinance] = useState<Finance | null>(null);
  const [openTransferModal, setOpenTransferModal] = useState(false);
  const [openWalletEditModal, setOpenWalletEditModal] = useState(false);
  const [currentQuery, setCurrentQuery] = useState<Query>(getFinanceQuery);
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

  const {
    data,
    refetch,
    isPending,
    isFetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useFinancesQuery(currentQuery);

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

  const buildQuery = (
    filterData: FinanceFilterDto | null,
    searchTerm: string,
  ): Query => {
    const queryFilter: Query = {
      ...getFinanceQuery,
      filter: [],
    } as any;

    if (!queryFilter.filter) return queryFilter;

    if (searchTerm) {
      queryFilter.filter.push({
        or: ['title', 'description', 'protocol'].map((field) => ({
          path: field,
          operator: 'contains',
          value: searchTerm,
          insensitive: true,
        })),
      } as any);
    }

    if (filterData?.flows && filterData.flows.length > 0) {
      queryFilter.filter.push({
        or: filterData.flows.map((flow) => ({
          path: 'flow',
          operator: 'equals',
          value: flow,
        })),
      } as any);
    } else if (filterData?.flow) {
      queryFilter.filter.push({
        path: 'flow',
        value: filterData.flow,
        filterGroup: 'and',
      } as any);
    }

    if (filterData?.status) {
      queryFilter.filter.push({
        path: 'status',
        value: filterData.status,
        filterGroup: 'and',
      } as any);
    }

    if (filterData?.typeId) {
      queryFilter.filter.push({
        path: 'typeId',
        value: filterData.typeId,
        filterGroup: 'and',
      } as any);
    }

    if (filterData?.bankId) {
      queryFilter.filter.push({
        path: 'bankId',
        value: filterData.bankId,
        filterGroup: 'and',
      } as any);
    }

    if (filterData?.categoryId) {
      queryFilter.filter.push({
        path: 'categoryId',
        value: filterData.categoryId,
        filterGroup: 'and',
      } as any);
    }

    if (filterData?.segmentId) {
      queryFilter.filter.push({
        path: 'segmentId',
        value: filterData.segmentId,
        filterGroup: 'and',
      } as any);
    }

    if (filterData?.payeeId) {
      queryFilter.filter.push({
        path: 'payeeId',
        value: filterData.payeeId,
        filterGroup: 'and',
      } as any);
    }

    if (filterData?.dateFrom) {
      queryFilter.filter.push({
        path: 'date',
        operator: 'gte',
        value: new Date(filterData.dateFrom),
        filterGroup: 'and',
      } as any);
    }

    if (filterData?.dateTo) {
      queryFilter.filter.push({
        path: 'date',
        operator: 'lte',
        value: new Date(filterData.dateTo),
        filterGroup: 'and',
      } as any);
    }

    return queryFilter;
  };

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
    if (JSON.stringify(newPagination) === JSON.stringify(pagination)) return;

    if (newPagination.pageIndex === pagination.pageIndex) {
      setPagination((prev) => ({ ...prev, pageSize: newPagination.pageSize }));
      return;
    }

    const requiredCount =
      (newPagination.pageIndex + 1) * newPagination.pageSize;

    setPagination(newPagination);

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

  return {
    finances: paginatedFinances,
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
    filter,
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
