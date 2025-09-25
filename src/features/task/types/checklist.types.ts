export type ChecklistItemType = 'BOOLEAN' | 'NUMBER' | 'TEXT';

export type ChecklistItemDto = {
  question: string;
  expectedType: ChecklistItemType;
};

export type ChecklistModuleDto = {
  name: string;
  items: ChecklistItemDto[];
};

export type ChecklistDto = {
  modules: ChecklistModuleDto[];
};
