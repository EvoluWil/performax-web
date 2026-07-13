import { Pagination } from '@/components/common/table/table';
import {
  contractService,
  getContractQuery,
} from '@/features/contract/services/contract.service';
import { ContractFilterDto } from '@/features/contract/schemas/contract.schema';
import { Contract } from '@/features/contract/types';
import {
  useContractMutation,
  useContractsQuery,
} from '@/features/contract/hooks/queries/contracts.query';
import { useCompanyPermissions } from '@/hooks/common/permission';
import { buildTextSearchOrFilter } from '@/utils/query';
import { Query } from 'nestjs-prisma-querybuilder-interface';
import { useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import swal from 'sweetalert2';

const defaultColumns = [
  'client',
  'type',
  'value',
  'adjustment',
  'startDate',
  'endDate',
  'dueDate',
  'scope',
  'active',
  'recurringId',
  'generatedPdf',
  'attachment',
];

const DEFAULT_TABLE_COLUMNS_KEY = '@performax:default-columns-contracts';

export const useContractList = () => {
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 30 });
  const [term, setTerm] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const [filter, setFilter] = useState<ContractFilterDto | null>(null);
  const [filteredContracts, setFilteredContracts] = useState<Contract[]>([]);
  const [filteredCount, setFilteredCount] = useState(0);
  const [openModal, setOpenModal] = useState(false);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(
    null,
  );
  const [openCustomizeColumnsModal, setOpenCustomizeColumnsModal] =
    useState(false);
  const [selectedColumnsKeys, setSelectedColumnsKeys] = useState<string[]>(
    () => {
      if (typeof window === 'undefined') return defaultColumns;
      const stored = localStorage.getItem(DEFAULT_TABLE_COLUMNS_KEY);
      return stored ? JSON.parse(stored) : defaultColumns;
    },
  );

  const { hasPermission, isReady: permissionsReady } = useCompanyPermissions();
  const hasAccess = permissionsReady && hasPermission('contract', 'read');

  const {
    data,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isRefetching,
    isPending,
  } = useContractsQuery({
    pageSize: pagination.pageSize,
    enabled: hasAccess && !filter,
  });

  const contractMutation = useContractMutation();

  const contracts = filter ? filteredContracts : (data?.contracts ?? []);
  const count = filter ? filteredCount : (data?.count ?? 0);

  const buildFilterQuery = (
    data: ContractFilterDto,
    searchTerm: string,
  ): Query => {
    const queryFilter: Query = {
      ...getContractQuery,
      filter: getContractQuery.filter ? [...getContractQuery.filter] : [],
      limit: pagination.pageSize,
    };

    if (searchTerm) {
      queryFilter.filter?.push({
        or: buildTextSearchOrFilter(searchTerm, ['scope'], {
          withClientName: true,
        }),
      } as any);
    }

    if (data.clientId) {
      queryFilter.filter?.push({
        path: 'clientId',
        value: data.clientId,
        filterGroup: 'and',
      });
    }

    if (data.typeId) {
      queryFilter.filter?.push({
        path: 'typeId',
        value: data.typeId,
        filterGroup: 'and',
      });
    }

    return queryFilter;
  };

  const handleFilter = async (data: ContractFilterDto) => {
    setFilter(Object.keys(data).some((k) => data[k as keyof ContractFilterDto]) ? data : null);

    if (!hasAccess) return;

    try {
      const queryFilter = buildFilterQuery(data, term);
      const result = await contractService.get(queryFilter as Query);
      setFilteredContracts(result?.data || []);
      setFilteredCount(result?.count ?? 0);
      setShowFilter(false);
      setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    } catch {
      toast.error('Erro ao aplicar filtros');
    }
  };

  const getContractReportData = async () => {
    if (!hasAccess) {
      return { contracts: [] as Contract[], total: 0, limit: 500 };
    }

    const queryFilter = buildFilterQuery(
      (filter || {}) as ContractFilterDto,
      term,
    );

    const result = await contractService.get({
      ...queryFilter,
      limit: 500,
      page: 1,
    } as Query);

    return {
      contracts: result?.data || [],
      total: result?.count ?? 0,
      limit: 500,
    };
  };

  const handleOpenAdd = () => setOpenModal(true);

  const handleCloseAdd = () => {
    setOpenModal(false);
    setSelectedContract(null);
  };

  const handleSelectContractToEdit = (contract: Contract) => {
    setSelectedContract(contract);
    setOpenModal(true);
  };

  const handleDeleteContract = async (contractId: string) => {
    swal.fire({
      title: 'Tem certeza que deseja excluir este contrato?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sim, excluir',
      cancelButtonText: 'Cancelar',
      preConfirm: async () => {
        await contractMutation.mutateAsync({ type: 'delete', id: contractId });
        toast.success('Contrato excluído com sucesso');
        if (filter) {
          await handleFilter(filter);
        } else {
          await refetch();
        }
      },
    });
  };

  const handleInactivateContract = async (contractId: string) => {
    swal.fire({
      title: 'Inativar contrato?',
      text: 'As próximas recorrências serão canceladas.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sim, inativar',
      cancelButtonText: 'Cancelar',
      preConfirm: async () => {
        await contractMutation.mutateAsync({ type: 'inactivate', id: contractId });
        toast.success('Contrato inativado com sucesso');
        if (filter) {
          await handleFilter(filter);
        } else {
          await refetch();
        }
      },
    });
  };

  const handleActivateContract = async (contractId: string) => {
    await contractMutation.mutateAsync({ type: 'activate', id: contractId });
    toast.success('Contrato reativado com sucesso');
    if (filter) {
      await handleFilter(filter);
    } else {
      await refetch();
    }
  };

  const handleReload = async () => {
    if (!hasAccess) {
      toast.info('Você não possui permissão para visualizar contratos.');
      return;
    }

    if (filter) {
      await handleFilter(filter);
    } else {
      const { data } = await refetch();
      if (data) toast.success('Dados atualizados com sucesso');
    }
  };

  const handleSearch = (search: string) => {
    setTerm(search);
    if (filter) {
      handleFilter(filter);
    }
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

    if (
      !filter &&
      contracts.length < requiredCount &&
      hasNextPage &&
      !isFetchingNextPage
    ) {
      await fetchNextPage();
    }
  };

  const toggleShowFilter = () => setShowFilter((prev) => !prev);
  const toggleCustomizeColumnsModal = () =>
    setOpenCustomizeColumnsModal((prev) => !prev);

  const handleUpdateColumns = (columns: string[]) => {
    setSelectedColumnsKeys(columns);
    localStorage.setItem(DEFAULT_TABLE_COLUMNS_KEY, JSON.stringify(columns));
    setOpenCustomizeColumnsModal(false);
  };

  const filteredByTerm = useMemo(() => {
    if (filter || !term) return contracts;
    return contracts.filter(
      (c) =>
        c.client?.name?.toLowerCase().includes(term.toLowerCase()) ||
        c.type?.name?.toLowerCase().includes(term.toLowerCase()) ||
        c.scope?.toLowerCase().includes(term.toLowerCase()),
    );
  }, [contracts, term, filter]);

  const paginatedContracts = filteredByTerm.slice(
    pagination.pageIndex * pagination.pageSize,
    (pagination.pageIndex + 1) * pagination.pageSize,
  );

  const loading = isPending || isRefetching || contractMutation.isPending;

  return {
    contracts: paginatedContracts,
    handleReload,
    handleSearch,
    showFilter,
    toggleShowFilter,
    handleFilter,
    selectedColumnsKeys,
    toggleCustomizeColumnsModal,
    openCustomizeColumnsModal,
    openModal,
    selectedContract,
    handleOpenAdd,
    handleCloseAdd,
    handleSelectContractToEdit,
    handleDeleteContract,
    handleInactivateContract,
    handleActivateContract,
    defaultColumns,
    tableKey: DEFAULT_TABLE_COLUMNS_KEY,
    handleUpdateColumns,
    pagination,
    handlePaginationChange,
    count,
    getContractReportData,
    loading,
  };
};
