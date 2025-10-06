"use client";

import { ChecklistDto } from "@/features/task/types";
import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
  conclusionInitialValues,
  ConclusionSchema,
  ConclusionSchemaType,
} from "./conclusion.schema";

export type UseConclusionProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: ConclusionSchemaType) => Promise<void>;
  taskChecklist?: ChecklistDto | null;
  hasIncompleteChecklist?: boolean;
};

export const useConclusion = ({
  open,
  onClose,
  onSubmit,
  hasIncompleteChecklist = false,
}: UseConclusionProps) => {
  const [loading, setLoading] = useState(false);

  const { control, handleSubmit, reset } = useForm<ConclusionSchemaType>({
    defaultValues: conclusionInitialValues,
    resolver: yupResolver(ConclusionSchema),
  });

  useEffect(() => {
    if (!open) reset(conclusionInitialValues);
  }, [open, reset]);

  const handleClose = () => {
    onClose();
  };

  const handleSave = handleSubmit(async (data) => {
    setLoading(true);
    await onSubmit?.(data as any);
    setLoading(false);
  });

  return {
    control,
    handleClose,
    handleSave,
    open,
    hasIncompleteChecklist,
    loading,
  };
};
