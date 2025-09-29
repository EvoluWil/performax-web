"use client";

import { ChecklistDto } from "@/features/task/types";
import { useEffect } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { ChecklistDtoSchema } from "./checklist.schema";

export type UseChecklistProps = {
  open: boolean;
  onClose: () => void;
  onSuccess?: (payload: ChecklistDto) => void;
  startWithModule?: boolean;
};

export const checklistInitialValues: ChecklistDto = {
  modules: [],
};

export const useChecklist = ({
  open,
  onClose,
  onSuccess,
  startWithModule = false,
}: UseChecklistProps) => {
  const { control, handleSubmit, register, reset } = useForm<ChecklistDto>({
    defaultValues: checklistInitialValues,
  });

  const { fields: modules, append: appendModule } = useFieldArray({
    control,
    name: "modules",
  });

  useEffect(() => {
    if (open && startWithModule) {
      if (!modules || modules.length === 0) {
        appendModule({ name: "", items: [] });
      }
    }
  }, [open, startWithModule, appendModule, modules]);

  const handleClose = () => {
    onClose();
    reset(checklistInitialValues);
  };

  const handleSave = handleSubmit((data) => {
    ChecklistDtoSchema.validate(data, { abortEarly: false })
      .then((valid) => {
        onSuccess?.(valid as any);
        handleClose();
      })
      .catch((err) => {
        if (err && err.inner && err.inner.length) {
          err.inner.forEach((e: any) => toast.error(e.message));
        } else {
          toast.error(err.message || "Erro ao validar checklist");
        }
      });
  });

  return {
    control,
    register,
    modules,
    handleClose,
    handleSave,
    open,
  };
};
