"use client";

import {
  ChecklistItemDto,
  ChecklistDto as ProjectChecklistDto,
} from "@/features/task/types";
import { useCallback, useEffect, useRef, useState } from "react";

export type UseChecklistProps = {
  checklist?: ProjectChecklistDto | null;
  onSubmitItem: (item: ChecklistItemDto, checklistId: string) => Promise<void>;
};

export const useChecklist = ({
  checklist,
  onSubmitItem,
}: UseChecklistProps) => {
  const [local, setLocal] = useState<ProjectChecklistDto>(
    () => checklist ?? { modules: [] }
  );
  const initialJsonRef = useRef<string>(
    JSON.stringify(checklist ?? { modules: [] })
  );
  const initialLocalRef = useRef<ProjectChecklistDto>(
    JSON.parse(JSON.stringify(checklist ?? { modules: [] }))
  );
  const [submittingItems, setSubmittingItems] = useState<
    Record<string, boolean>
  >({});

  useEffect(() => {
    setLocal(checklist ?? { modules: [] });
    initialJsonRef.current = JSON.stringify(checklist ?? { modules: [] });
    initialLocalRef.current = JSON.parse(
      JSON.stringify(checklist ?? { modules: [] })
    );
  }, [checklist]);

  const isFilled = useCallback((it: any) => {
    const type = (it?.expectedType || "").toString().toUpperCase();
    if (type === "BOOLEAN")
      return it.valueBoolean !== null && it.valueBoolean !== undefined;
    if (type === "NUMBER")
      return (
        it.valueNumber !== null &&
        it.valueNumber !== undefined &&
        !Number.isNaN(it.valueNumber)
      );
    if (type === "TEXT")
      return (it.valueText ?? "").toString().trim().length > 0;
    return (it.valueText ?? "").toString().trim().length > 0;
  }, []);

  const isItemChanged = useCallback(
    (modIndex: number, itemIndex: number) => {
      const currentItem = local?.modules?.[modIndex]?.items?.[itemIndex];
      const initialItem =
        initialLocalRef.current?.modules?.[modIndex]?.items?.[itemIndex];
      if (!currentItem) return false;
      const a = {
        valueBoolean: (currentItem as any).valueBoolean,
        valueNumber: (currentItem as any).valueNumber,
        valueText: (currentItem as any).valueText,
      };
      const b = {
        valueBoolean: (initialItem as any)?.valueBoolean,
        valueNumber: (initialItem as any)?.valueNumber,
        valueText: (initialItem as any)?.valueText,
      };
      return JSON.stringify(a) !== JSON.stringify(b);
    },
    [local]
  );

  const isSubmittingItem = useCallback(
    (modIndex: number, itemIndex: number) => {
      return !!submittingItems[`${modIndex}-${itemIndex}`];
    },
    [submittingItems]
  );

  const submitItem = useCallback(
    async (modIndex: number, itemIndex: number) => {
      const key = `${modIndex}-${itemIndex}`;
      const item = local?.modules?.[modIndex]?.items?.[itemIndex];
      if (!item) return;
      try {
        setSubmittingItems((s) => ({ ...s, [key]: true }));
        await onSubmitItem(item, checklist?.id as string);
      } finally {
        setSubmittingItems((s) => {
          const next = { ...s };
          delete next[key];
          return next;
        });
      }
    },
    [checklist, local?.modules, onSubmitItem]
  );

  const updateItem = useCallback(
    (modIndex: number, itemIndex: number, patch: Partial<any>) => {
      setLocal((prev) => {
        const copy = JSON.parse(
          JSON.stringify(prev || { modules: [] })
        ) as ProjectChecklistDto;
        copy.modules = copy.modules || [];
        const mod = copy.modules[modIndex];
        if (!mod) return prev;
        mod.items = mod.items || [];
        const it = mod.items[itemIndex] || {};
        mod.items[itemIndex] = { ...it, ...patch };

        const itemRefAny = mod.items[itemIndex] as any;
        if (!Object.prototype.hasOwnProperty.call(itemRefAny, "valueBoolean"))
          itemRefAny.valueBoolean = null;
        if (!Object.prototype.hasOwnProperty.call(itemRefAny, "valueNumber"))
          itemRefAny.valueNumber = null;
        if (!Object.prototype.hasOwnProperty.call(itemRefAny, "valueText"))
          itemRefAny.valueText = null;

        return copy;
      });
    },
    []
  );

  return {
    local,
    updateItem,
    isFilled,
    isItemChanged,
    isSubmittingItem,
    submitItem,
  } as const;
};
