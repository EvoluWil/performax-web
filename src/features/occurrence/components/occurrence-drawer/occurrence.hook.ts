import { useClientsQuery } from '@/features/client/hooks';
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
import { useUsersQuery } from '@/features/user/hooks';
import { useUpload } from '@/hooks/common/upload';
import { File } from '@/types/file';
import { formatterSelectOptions } from '@/utils/select';
import { yupResolver } from '@hookform/resolvers/yup';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { OccurrenceDrawerProps } from './occurrence';

export const useOccurrenceDrawer = ({
  onClose,
  open,
  occurrence: selectedOccurrence,
  onSuccess,
}: OccurrenceDrawerProps) => {
  const [occurrence, setOccurrence] = useState<Occurrence | null>(
    selectedOccurrence || null,
  );

  const occurrenceMutation = useOccurrenceMutation();
  const { sendFiles, deleteFile } = useUpload();

  const { data: clientsQueryData } = useClientsQuery({
    scopeModule: 'client',
    pageSize: 1000,
  });

  const { data: occurrenceTypes } = useOccurrenceTypesQuery();

  const { data: usersResponse } = useUsersQuery({
    scopeModule: 'occurrence',
    pageSize: 1000,
  });

  const options = useMemo(() => {
    const clients = clientsQueryData?.clients ?? [];
    const users = usersResponse?.users || [];

    return {
      clients: formatterSelectOptions(clients, 'id', 'name'),
      types: formatterSelectOptions(occurrenceTypes, 'id', 'name'),
      users: formatterSelectOptions(users, 'id', 'name'),
    };
  }, [clientsQueryData, occurrenceTypes, usersResponse]);

  const { control, handleSubmit, reset } = useForm<OccurrenceFormDto>({
    defaultValues: occurrenceFormInitialValues,
    resolver: yupResolver(occurrenceFormSchema) as any,
  });

  const handleOccurrence = handleSubmit(async (data: OccurrenceFormDto) => {
    let documents = occurrence?.documents || [];

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
    defaultFiles: occurrence?.documents || [],
    editing: !!occurrence,
    handleRemoveDefaultFile,
  };
};
