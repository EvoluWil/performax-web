import { Client } from '@/features/client/types';
import {
  useOccurrenceMutation,
  useOccurrenceTypesQuery,
} from '@/features/occurrence/hooks';
import {
  OccurrenceFormDto,
  occurrenceFormInitialValues,
  occurrenceFormSchema,
} from '@/features/occurrence/schemas';
import { Occurrence } from '@/features/occurrence/types';
import { useCompanyPermissions } from '@/hooks/common/permission';
import { useUpload } from '@/hooks/common/upload';
import { useCompanyGroupQuery } from '@/hooks/queries/company-group.query';
import { useFormResources } from '@/hooks/use-form-resources';
import { companyService } from '@/services/company.service';
import { Company } from '@/types/company';
import { File } from '@/types/file';
import { formatterSelectOptions } from '@/utils/select';
import { yupResolver } from '@hookform/resolvers/yup';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { OccurrenceType } from '../../types';
import { OccurrenceDrawerProps } from './occurrence';

export const useOccurrenceDrawer = ({
  onClose,
  open,
  occurrence: selectedOccurrence,
  onSuccess,
}: OccurrenceDrawerProps) => {
  const { hasPermission } = useCompanyPermissions();
  const [occurrence, setOccurrence] = useState<Occurrence | null>(
    selectedOccurrence || null,
  );

  const occurrenceMutation = useOccurrenceMutation();
  const { sendFiles, deleteFile } = useUpload();

  const defaultCompanyId = companyService.getDefaultCompany()?.id;
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>(
    defaultCompanyId || '',
  );
  const { data: companyGroup } = useCompanyGroupQuery(defaultCompanyId);
  const companyOptions = useMemo(
    () =>
      (companyGroup?.companies ?? []).map((c) => ({
        value: c.id,
        label: c.name,
      })),
    [companyGroup],
  );

  const { options: resourceOptions, setSearch } = useFormResources(
    ['clients', 'users'],
    selectedCompanyId,
  );

  const canCreateClient = hasPermission('client', 'write');
  const canCreateOccurrenceType = hasPermission('occurrence', 'write');

  const [clientDrawerOpen, setClientDrawerOpen] = useState(false);
  const [clientInitialName, setClientInitialName] = useState('');
  const [occurrenceTypeDrawerOpen, setOccurrenceTypeDrawerOpen] =
    useState(false);
  const [occurrenceTypeInitialName, setOccurrenceTypeInitialName] =
    useState('');

  const clientCreateRef = useRef<{
    resolve: (id: string) => void;
    reject: (error: Error) => void;
  } | null>(null);

  const occurrenceTypeCreateRef = useRef<{
    resolve: (id: string) => void;
    reject: (error: Error) => void;
  } | null>(null);

  const handleOpenCreateClient = (label: string) => {
    setClientInitialName(label);
    setClientDrawerOpen(true);

    return new Promise<string>((resolve, reject) => {
      clientCreateRef.current = { resolve, reject };
    });
  };

  const handleCloseClientDrawer = () => {
    setClientDrawerOpen(false);
    setClientInitialName('');

    if (clientCreateRef.current) {
      clientCreateRef.current.reject(new Error('cancelled'));
      clientCreateRef.current = null;
    }
  };

  const handleClientCreated = (client: Client) => {
    clientCreateRef.current?.resolve(client.id);
    clientCreateRef.current = null;
    setClientDrawerOpen(false);
    setClientInitialName('');
  };

  const handleOpenCreateOccurrenceType = (label: string) => {
    setOccurrenceTypeInitialName(label);
    setOccurrenceTypeDrawerOpen(true);

    return new Promise<string>((resolve, reject) => {
      occurrenceTypeCreateRef.current = { resolve, reject };
    });
  };

  const handleCloseOccurrenceTypeDrawer = () => {
    setOccurrenceTypeDrawerOpen(false);
    setOccurrenceTypeInitialName('');

    if (occurrenceTypeCreateRef.current) {
      occurrenceTypeCreateRef.current.reject(new Error('cancelled'));
      occurrenceTypeCreateRef.current = null;
    }
  };

  const handleOccurrenceTypeCreated = (occurrenceType: OccurrenceType) => {
    occurrenceTypeCreateRef.current?.resolve(occurrenceType.id);
    occurrenceTypeCreateRef.current = null;
    setOccurrenceTypeDrawerOpen(false);
    setOccurrenceTypeInitialName('');
  };

  const { data: occurrenceTypes } = useOccurrenceTypesQuery(selectedCompanyId);

  const options = useMemo(() => {
    return {
      clients: resourceOptions.clients ?? [],
      types: formatterSelectOptions(occurrenceTypes, 'id', 'name'),
      users: resourceOptions.users ?? [],
    };
  }, [resourceOptions, occurrenceTypes]);

  const { control, handleSubmit, reset } = useForm<OccurrenceFormDto>({
    defaultValues: occurrenceFormInitialValues,
    resolver: yupResolver(occurrenceFormSchema) as any,
  });

  const handleOccurrence = handleSubmit(async (data: OccurrenceFormDto) => {
    let documents = occurrence?.documents || [];

    const originalCompany = companyService.getDefaultCompany();
    if (selectedCompanyId && selectedCompanyId !== originalCompany?.id) {
      const picked = companyGroup?.companies.find(
        (c) => c.id === selectedCompanyId,
      );
      if (picked)
        companyService.setDefaultCompany({ ...picked, ownerId: '' } as Company);
    }
    try {
      if (data.documents && data.documents.length > 0) {
        const files = await sendFiles(
          data.documents as any,
          `occurrences/${data.title}`,
        );
        documents = [...documents, ...files];
      }

      const result = await occurrenceMutation.mutateAsync({
        type: occurrence ? 'update' : 'create',
        data: {
          ...data,
          documents,
        } as any,
        id: occurrence?.id,
      });

      if (result) {
        toast.success(
          occurrence
            ? 'Ocorrência atualizada com sucesso'
            : 'Ocorrência criada com sucesso',
        );
        handleClose();
        onClose();
        if (onSuccess) onSuccess();
      }
    } finally {
      if (originalCompany) companyService.setDefaultCompany(originalCompany);
    }
  });

  const handleRemoveDefaultFile = async (file: File) => {
    if (!occurrence) return;

    try {
      const result = await occurrenceMutation.mutateAsync({
        type: 'update',
        data: {
          documents:
            occurrence.documents?.filter((f) => f.url !== file.url) || [],
        } as any,
        id: occurrence.id,
      });

      if (result) {
        await deleteFile(file.url || '');
        setOccurrence((prev) =>
          prev
            ? {
                ...prev,
                documents: prev.documents?.filter((f) => f.url !== file.url),
              }
            : prev,
        );
        toast.success('Arquivo removido com sucesso');
      }
    } catch {
      toast.error('Erro ao remover arquivo');
    }
  };

  const handleClose = () => {
    onClose();
    reset();
  };

  useEffect(() => {
    if (occurrence) {
      reset({
        title: occurrence.title || '',
        description: occurrence.description || '',
        observation: occurrence.observation || '',
        date: occurrence.date ? (new Date(occurrence.date) as any) : '',
        clientId: occurrence.client?.id || '',
        typeId: occurrence.type?.id || '',
        responsibleId: occurrence.responsible?.id || '',
        documents: [],
      });
    } else {
      reset(occurrenceFormInitialValues);
    }
  }, [occurrence, reset]);

  return {
    control,
    handleOccurrence,
    loading: occurrenceMutation.isPending,
    handleClose,
    open,
    options,
    setSearch,
    canCreateClient,
    canCreateOccurrenceType,
    handleOpenCreateClient,
    handleOpenCreateOccurrenceType,
    clientDrawerOpen,
    occurrenceTypeDrawerOpen,
    clientInitialName,
    occurrenceTypeInitialName,
    handleCloseClientDrawer,
    handleCloseOccurrenceTypeDrawer,
    handleClientCreated,
    handleOccurrenceTypeCreated,
    defaultFiles: occurrence?.documents || [],
    editing: !!occurrence,
    handleRemoveDefaultFile,
    companyOptions,
    selectedCompanyId,
    setSelectedCompanyId,
  };
};
