import { useClientsQuery } from '@/features/client/hooks';
import { useEmployeeMutation } from '@/features/employee/hooks';
import {
  EmployeeFormDto,
  employeeFormInitialValues,
  employeeFormSchema,
} from '@/features/employee/schemas';
import { yupResolver } from '@hookform/resolvers/yup';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { EmployeeDrawerProps } from './employee';

export const useEmployeeDrawer = ({
  onClose,
  open,
  employee,
  initialName,
  onCreated,
}: EmployeeDrawerProps) => {
  const employeeMutation = useEmployeeMutation();
  const [clientSearch, setClientSearch] = useState('');

  const { data: clientsData } = useClientsQuery({ scopeModule: 'client' });

  const clientOptions = useMemo(() => {
    const clients = clientsData?.clients ?? [];
    const filtered = clientSearch
      ? clients.filter((c) =>
          c.name?.toLowerCase().includes(clientSearch.toLowerCase()),
        )
      : clients;

    return filtered.map((c) => ({
      value: c.id,
      label: c.name,
    }));
  }, [clientsData, clientSearch]);

  const { control, handleSubmit, reset } = useForm<EmployeeFormDto>({
    defaultValues: employeeFormInitialValues,
    resolver: yupResolver(employeeFormSchema),
  });

  const handleEmployee = handleSubmit(async (data: EmployeeFormDto) => {
    const payload: EmployeeFormDto = {
      ...data,
      clientId: data.clientId || undefined,
    };

    const result = await employeeMutation.mutateAsync({
      type: employee ? 'update' : 'create',
      data: payload,
      id: employee?.id,
    });

    if (result) {
      toast.success(
        employee
          ? 'Funcionário atualizado com sucesso'
          : 'Funcionário criado com sucesso',
      );
      if (!employee) {
        onCreated?.(result);
      }
      handleClose();
      onClose();
    }
  });

  const handleClose = () => {
    onClose();
    reset();
  };

  const handleClientSearch = (value: string) => {
    setClientSearch(value);
  };

  useEffect(() => {
    if (employee) {
      reset({
        name: employee.name,
        cpf: employee.cpf,
        clientId: employee.clientId ?? '',
      });
    } else {
      reset({ ...employeeFormInitialValues, name: initialName || '' });
    }
  }, [employee, reset, initialName]);

  return {
    control,
    handleEmployee,
    loading: employeeMutation.isPending,
    handleClose,
    open,
    editing: !!employee,
    clientOptions,
    handleClientSearch,
  };
};
