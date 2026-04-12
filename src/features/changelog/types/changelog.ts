export type ChangelogType =
  | 'FEATURE'
  | 'FIX'
  | 'IMPROVEMENT'
  | 'BREAKING'
  | 'SECURITY';

export type Changelog = {
  id: string;
  version: string;
  title: string;
  description: string[];
  type: ChangelogType;
  date: string;
  deleted: boolean;
  createdAt: string;
  updatedAt: string;
};
