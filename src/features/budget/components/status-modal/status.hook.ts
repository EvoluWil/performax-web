import { useState } from "react";
import { useForm } from "react-hook-form";

type HookProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (status: string) => Promise<void>;
  defaultStatus: string;
};

export const useBudgetStatusModal = ({
  onClose,
  onSubmit,
  defaultStatus,
}: HookProps) => {
  const [loading, setLoading] = useState(false);
  const { control, handleSubmit, reset } = useForm<{ status: string }>({
    defaultValues: { status: defaultStatus },
  });

  const handleSave = handleSubmit(async ({ status }) => {
    try {
      setLoading(true);
      await onSubmit(status);
      handleClose();
    } finally {
      setLoading(false);
    }
  });

  const handleClose = () => {
    onClose();
    reset({ status: defaultStatus });
  };

  return { control, handleSave, handleClose, loading };
};
