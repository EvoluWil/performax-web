export type ChecklistItemType = "BOOLEAN" | "NUMBER" | "TEXT";

export type ChecklistItemDto = {
  question: string;
  expectedType: ChecklistItemType;
  id?: string;
  valueBoolean?: boolean | null;
  valueNumber?: number | null;
  valueText?: string | null;
};

export type ChecklistModuleDto = {
  name: string;
  items: ChecklistItemDto[];
  id?: string;
};

export type ChecklistDto = {
  modules: ChecklistModuleDto[];
  id?: string;
};

export type ChecklistItemUpdateDto = {
  valueBoolean?: boolean | null;
  valueNumber?: number | null;
  valueText?: string | null;
};
