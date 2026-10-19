import { Pagination } from '@/components/common/table/table';
import {
  useEmployeeMutation,
  useEmployeesQuery,
} from '@/features/employee/hooks';
import { Employee } from '@/features/employee/types';
import { useListUrlEffects, useSimpleListUrlState } from '@/hooks/common/use-list-url-state';
import { mergePaginationChange } from '@/utils/list-url-state';
import { useState } from 'react';
import { toast } from 'react-toastify';
import swal from 'sweetalert2';

export const useEmployeeList = () => {
  const {
    q: urlQ,
    pagination: urlPagination,
    hasUrlParams,
    syncUrl,
  } = useSimpleListUrlState();

  const [openModal, setOpenModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null,
  );
  const [term, setTerm] = useState(urlQ);
  const [pagination, setPagination] = useState(urlPagination);

  const { data, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useEmployeesQuery({
      scopeModule: 'employee',
      pageSize: pagination.pageSize,
    });

  const employees = data?.employees ?? [];
  const count = data?.count ?? 0;

  const employeeMutation = useEmployeeMutation();

  const handleOpenAdd = () => {
    setOpenModal(true);
  };

  const handleCloseAdd = () => {
    setOpenModal(false);
    setSelectedEmployee(null);
  };

  const handleSelectEmployeeToEdit = (employee: Employee) => {
    setSelectedEmployee(employee);
    setOpenModal(true);
  };

  const handleDeleteEmployee = async (employeeId: string) => {
    swal.fire({
      title: 'Tem certeza que deseja excluir este funcionário?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sim, excluir',
      cancelButtonText: 'Cancelar',
      preConfirm: async () => {
        const result = await employeeMutation.mutateAsync({
          type: 'delete',
          id: employeeId,
        });

        if (result) {
          toast.success('Funcionário excluído com sucesso');
        }
      },
    });
  };

  const handleReload = async () => {
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    const { data } = await refetch();

    if (data) {
      toast.success('Dados atualizados com sucesso');
    }
  };

  const handleSearch = (search: string) => {
    setTerm(search);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
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

    if (
      employees.length < requiredCount &&
      hasNextPage &&
      !isFetchingNextPage
    ) {
      await fetchNextPage();
    }
  };

  const filteredEmployees = employees.filter(
    (employee) =>
      employee.name?.toLowerCase().includes(term.toLowerCase()) ||
      employee.cpf?.toLowerCase().includes(term.toLowerCase()),
  );

  const paginatedEmployees = filteredEmployees.slice(
    pagination.pageIndex * pagination.pageSize,
    (pagination.pageIndex + 1) * pagination.pageSize,
  );

  useListUrlEffects({
    hasUrlParams,
    urlState: { q: urlQ, pagination: urlPagination, filter: {} },
    state: { q: term, pagination, filter: {} },
    syncUrl,
  });

  return {
    employees: paginatedEmployees,
    term,
    openModal,
    selectedEmployee,
    handleOpenAdd,
    handleReload,
    handleSearch,
    handleCloseAdd,
    handleDeleteEmployee,
    handleSelectEmployeeToEdit,
    pagination,
    handlePaginationChange,
    count,
  };
};
