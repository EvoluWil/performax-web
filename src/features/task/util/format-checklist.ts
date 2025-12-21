import { ChecklistDto } from "../types";

export const formatChecklist = (
  checklist: ChecklistDto
): ChecklistDto | null => {
  if (!checklist) return null;

  return {
    modules: checklist.modules.map((mod) => ({
      name: mod.name,
      items: mod.items.map((item) => ({
        question: item.question,
        expectedType: item.expectedType,
      })),
    })),
  };
};
