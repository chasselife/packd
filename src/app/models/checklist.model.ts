export interface Checklist {
  id?: number;
  title: string;
  icon?: string;
  color?: string;
  items?: ChecklistItem[];
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
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}
