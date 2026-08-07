import { Pagination } from '@/components/common/table/table';
import {
  useOccurrenceApprovalMutation,
  useOccurrenceMutation,
  useOccurrencesQuery,
} from '@/features/occurrence/hooks';
import {
  buildOccurrenceStatusOrFilter,
  OccurrenceFilterDto,
  occurrenceFilterInitialValues,
} from '@/features/occurrence/schemas';
import {
  getOccurrenceQuery,
  occurrenceService,
} from '@/features/occurrence/services';
import { Occurrence } from '@/features/occurrence/types';
import { useListUrlEffects, useListUrlState } from '@/hooks/common/use-list-url-state';
import { useCompanyPermissions } from '@/hooks/common/permission';
import { applyScopedFilter, buildTextSearchOrFilter, pushInFilter } from '@/utils/query';
import {
  hasActiveFilterParams,
  parseOccurrenceFilterFromUrl,
  serializeOccurrenceFilterToUrl,
} from '@/utils/list-url-serializers';
import { useMediaQuery } from '@mui/material';
import { Filter, Query } from 'nestjs-prisma-querybuilder-interface';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import swal from 'sweetalert2';

const defaultColumns = [
  'protocol',
  'title',
  'client',
  'type',
  'createdBy',
  'date',
  'createdAt',
  'status',
];

const DEFAULT_TABLE_COLUMNS_KEY = '@performax:default-columns-occurrences';

export const useOccurrenceList = () => {
  const {
    q: urlQ,
    pagination: urlPagination,
    filter: urlFilter,
    hasUrlParams,
    syncUrl,
  } = useListUrlState({
    defaultFilter: occurrenceFilterInitialValues,
    parseFilter: parseOccurrenceFilterFromUrl,
    serializeFilter: (filter) =>
      serializeOccurrenceFilterToUrl(filter ?? occurrenceFilterInitialValues),
  });

  const [pagination, setPagination] = useState(urlPagination);
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
  } = useOccurrencesQuery({ pageSize: pagination.pageSize });

  const occurrences = data?.occurrences ?? [];

  const [term, setTerm] = useState(urlQ);
  const [showFilter, setShowFilter] = useState(false);
  const [filter, setFilter] = useState<OccurrenceFilterDto | null>(() =>
    hasActiveFilterParams(serializeOccurrenceFilterToUrl(urlFilter), urlQ)
      ? urlFilter
      : null,
  );
  const [selectedColumnsKeys, setSelectedColumnsKeys] =
    useState<string[]>(defaultColumns);
  const [openCustomizeColumnsModal, setOpenCustomizeColumnsModal] =
    useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'list'>('table');
  const [filteredOccurrences, setFilteredOccurrences] = useState<
    Occurrence[] | null
  >(null);
  const [openModal, setOpenModal] = useState(false);
  const [selectedOccurrence, setSelectedOccurrence] =
    useState<Occurrence | null>(null);

  const occurrenceMutation = useOccurrenceMutation();
  const { getScopedUserIds, userId } = useCompanyPermissions();

  const scopedOccurrenceUserIds = useMemo(
    () => getScopedUserIds('occurrence'),
    [getScopedUserIds],
  );

  const hasOccurrenceAccess =
    scopedOccurrenceUserIds === null || scopedOccurrenceUserIds.length > 0;

  const isSmallScreen = useMediaQuery((theme) => theme.breakpoints.down('md'));
  const { push } = useRouter();

  const handleReload = async () => {
    if (!hasOccurrenceAccess) {
      toast.info('Você não possui permissão para visualizar ocorrências.');
      return;
    }

    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    const { data: reloadedData } = await refetch();
    if (reloadedData) toast.success('Dados atualizados com sucesso');
  };

  const handleRowClick = (row: Occurrence) => {
    push(`/panel/occurrences/${row.id}`);
  };

  const handleDeleteOccurrence = async (id: string) => {
    swal.fire({
      title: 'Tem certeza que deseja excluir esta ocorrência?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sim, excluir',
      cancelButtonText: 'Cancelar',
      preConfirm: async () => {
        const result = await occurrenceMutation.mutateAsync({
          type: 'delete',
          id,
        });
        if (result) {
          toast.success('Ocorrência excluída com sucesso');
          await refetch();
        }
      },
    });
  };

  const handleOpenAdd = async () => setOpenModal(true);

  const handleCloseAdd = () => {
    setOpenModal(false);
    setSelectedOccurrence(null);
  };

  const handleSelectOccurrenceToEdit = (occurrence: Occurrence) => {
    setSelectedOccurrence(occurrence);
    setOpenModal(true);
  };

  const toggleShowFilter = () => setShowFilter((prev) => !prev);
  const toggleCustomizeColumnsModal = () =>
    setOpenCustomizeColumnsModal((prev) => !prev);

  const buildOccurrenceFilterQuery = (
    data: OccurrenceFilterDto,
    currentTerm = term,
  ): Query => {
    const termFilter: Filter = [];

    if (currentTerm) {
      termFilter.push(
        ...buildTextSearchOrFilter(
          currentTerm,
          ['title', 'description', 'protocol'],
          { withClientName: true },
        ),
      );
    }

    const queryFilter: Query = {
      ...getOccurrenceQuery,
      filter: [],
    } as any;

    if (queryFilter.filter) {
      const statusFilter = buildOccurrenceStatusOrFilter(data);
      if (statusFilter.length) {
        queryFilter.filter.push(...statusFilter);
      }

      if (termFilter.length) {
        queryFilter.filter.push({ or: termFilter });
      }

      pushInFilter(queryFilter.filter, 'clientId', data?.clientIds);

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

      pushInFilter(queryFilter.filter, 'createdById', data?.userIds);
    }

    return queryFilter;
  };

  const handleFilter = async (
    data: OccurrenceFilterDto,
    currentTerm = term,
    page = 1,
  ) => {
    setFilter(Object.keys(data)?.length ? data : null);

    if (!hasOccurrenceAccess) {
      setFilteredOccurrences([]);
      setShowFilter(false);
      return;
    }

    try {
      const queryFilter = buildOccurrenceFilterQuery(data, currentTerm);

      const scopedQuery = applyScopedFilter(
        queryFilter as Query,
        scopedOccurrenceUserIds,
        userId,
        {
          field: 'createdById',
          operator: 'in',
        },
      );

      if (!scopedQuery) {
        setFilteredOccurrences([]);
        setShowFilter(false);
        return;
      }

      const result = await occurrenceService.get({
        ...scopedQuery,
        limit: pagination.pageSize,
        page,
      } as any);
      setFilteredOccurrences(result?.data || []);
      setFilteredCount(result?.count ?? 0);
      setShowFilter(false);
    } catch (e) {
      console.error(e);
      toast.error('Erro ao aplicar filtros');
    }
  };

  const getOccurrenceReportData = async () => {
    if (!hasOccurrenceAccess) {
      return { occurrences: [] as Occurrence[], total: 0, limit: 500 };
    }

    try {
      const queryFilter = buildOccurrenceFilterQuery(
        (filter || {}) as OccurrenceFilterDto,
        term,
      );

      const scopedQuery = applyScopedFilter(
        queryFilter as Query,
        scopedOccurrenceUserIds,
        userId,
        {
          field: 'createdById',
          operator: 'in',
        },
      );

      if (!scopedQuery) {
        return { occurrences: [] as Occurrence[], total: 0, limit: 500 };
      }

      const result = await occurrenceService.get({
        ...scopedQuery,
        limit: 500,
        page: 1,
      } as any);

      return {
        occurrences: result?.data || [],
        total: result?.count ?? 0,
        limit: 500,
      };
    } catch (e) {
      console.error(e);
      toast.error('Erro ao gerar relatório de ocorrências');
      return { occurrences: [] as Occurrence[], total: 0, limit: 500 };
    }
  };

  const handleSearch = async (search: string) => {
    setTerm(search);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    await handleFilter(filter || ({} as OccurrenceFilterDto), search, 1);
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

  const approvalMutation = useOccurrenceApprovalMutation();

  const handleApprove = async (occurrenceId: string, approved: boolean) => {
    await approvalMutation.mutateAsync({ id: occurrenceId, approved });
    toast.success(
      approved
        ? 'Ocorrência aprovada com sucesso'
        : 'Ocorrência reprovada com sucesso',
    );
  };

  useListUrlEffects({
    hasUrlParams,
    urlState: { q: urlQ, pagination: urlPagination, filter: urlFilter },
    state: {
      q: term,
      pagination,
      filter: filter ?? occurrenceFilterInitialValues,
    },
    syncUrl,
    onApplyFromUrl: async (nextFilter, nextTerm, page) => {
      if (
        hasActiveFilterParams(
          serializeOccurrenceFilterToUrl(nextFilter),
          nextTerm,
        )
      ) {
        await handleFilter(nextFilter, nextTerm, page);
      }
    },
  });

  const count = filter ? filteredCount : (data?.count ?? 0);

  const currentOccurrencesAll = (
    hasOccurrenceAccess
      ? filter
        ? filteredOccurrences || []
        : occurrences
      : []
  ).filter(
    (o) =>
      o.title?.toLowerCase().includes(term.toLowerCase()) ||
      o.description?.toLowerCase().includes(term.toLowerCase()) ||
      o.protocol?.toLowerCase().includes(term.toLowerCase()),
  );

  const paginatedOccurrences = filter
    ? currentOccurrencesAll
    : currentOccurrencesAll.slice(
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
        occurrences.length < requiredCount &&
        hasNextPage &&
        !isFetchingNextPage
      ) {
        await fetchNextPage();
      }
    }
  };

  return {
    openModal,
    selectedOccurrence,
    handleOpenAdd,
    handleCloseAdd,
    handleSelectOccurrenceToEdit,
    term,
    filter,
    occurrences: paginatedOccurrences,
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
    handleDeleteOccurrence,
    selectedColumnsKeys,
    handleUpdateColumns: (cols: string[]) => setSelectedColumnsKeys(cols),
    defaultColumns,
    tableKey: DEFAULT_TABLE_COLUMNS_KEY,
    toggleCustomizeColumnsModal,
    openCustomizeColumnsModal,
    getOccurrenceReportData,
    handleApprove,
  };
};
