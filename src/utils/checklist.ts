import { ChecklistDto } from "@/features/task/types";

export const hasIncompleteChecklist = (checklist?: ChecklistDto) => {
  if (!checklist || !Array.isArray(checklist.modules)) return false;
  for (const mod of checklist.modules) {
    if (!Array.isArray(mod.items)) continue;
    for (const it of mod.items as any[]) {
      const type = (it?.expectedType || "").toString().toUpperCase();
      if (type === "BOOLEAN") {
        if (it.valueBoolean === null || it.valueBoolean === undefined)
          return true;
      } else if (type === "NUMBER") {
        if (
          it.valueNumber === null ||
          it.valueNumber === undefined ||
          Number.isNaN(it.valueNumber)
        )
          return true;
      } else {
        if (!it.valueText || String(it.valueText).trim().length === 0)
          return true;
      }
    }
  }
  return false;
};
