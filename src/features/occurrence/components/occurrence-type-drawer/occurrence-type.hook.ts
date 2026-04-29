import { useOccurrenceTypeMutation } from '@/features/occurrence/hooks';
import {
  OccurrenceTypeFormDto,
  occurrenceTypeFormInitialValues,
  occurrenceTypeFormSchema,
} from '@/features/occurrence/schemas';
import { yupResolver } from '@hookform/resolvers/yup';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { OccurrenceTypeDrawerProps } from './occurrence-type';

export const useOccurrenceTypeDrawer = ({
  onClose,
  open,
  occurrenceType,
  initialName,
  onCreated,
}: OccurrenceTypeDrawerProps) => {
  const occurrenceTypeMutation = useOccurrenceTypeMutation();

  const { control, handleSubmit, reset } = useForm<OccurrenceTypeFormDto>({
    defaultValues: occurrenceTypeFormInitialValues,
    resolver: yupResolver(occurrenceTypeFormSchema),
  });

  const handleOccurrenceType = handleSubmit(
    async (data: OccurrenceTypeFormDto) => {
      const result = await occurrenceTypeMutation.mutateAsync({
        type: occurrenceType ? 'update' : 'create',
        data,
        id: occurrenceType?.id,
      });

      if (result) {
        toast.success(
          occurrenceType
            ? 'Tipo de ocorrência atualizado com sucesso'
            : 'Tipo de ocorrência criado com sucesso',
        );
        if (!occurrenceType) {
          onCreated?.(result);
        }
        handleClose();
        onClose();
      }
    },
  );

  const handleClose = () => {
    onClose();
    reset();
  };

  useEffect(() => {
    if (occurrenceType) {
      reset({
        name: occurrenceType.name,
        needApprove: occurrenceType.needApprove,
      });
    } else {
      reset({ ...occurrenceTypeFormInitialValues, name: initialName || '' });
    }
  }, [occurrenceType, reset, initialName]);

  return {
    control,
    handleOccurrenceType,
    loading: occurrenceTypeMutation.isPending,
    handleClose,
    open,
    editing: !!occurrenceType,
  };
};
