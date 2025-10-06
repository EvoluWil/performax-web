"use client";

import { yupResolver } from "@hookform/resolvers/yup";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { ImpedimentSchema, impedimentInitialValues } from "./impediment.schema";

export type UseImpedimentProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (impedimentNote: string) => Promise<void>;
};

export const useImpediment = ({
  open,
  onClose,
  onSubmit,
}: UseImpedimentProps) => {
  const [loading, setLoading] = useState(false);
  const { control, handleSubmit } = useForm({
    defaultValues: impedimentInitialValues,
    resolver: yupResolver(ImpedimentSchema),
  });

  const handleSave = handleSubmit(async ({ impedimentNote }) => {
    setLoading(true);
    await onSubmit(impedimentNote);
    setLoading(false);
  });

  const handleClose = () => {
    onClose();
  };

  return {
    control,
    handleClose,
    handleSave,
    open,
    loading,
  };
};
