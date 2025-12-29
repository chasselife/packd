export interface Checklist {
  id?: number;
  title: string;
  icon?: string;
  color?: string;
  items?: ChecklistItem[];
  sortOrder: number;
  groupId?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChecklistItem {
  id?: number;
  checklistId: number;
  title: string;
  description?: string;
  isDone: boolean;
  icon?: string;
  subItems?: string[];
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}
