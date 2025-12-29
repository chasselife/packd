export interface ChecklistGroup {
  id?: number;
  title: string;
  description?: string;
  icon?: string;
  color?: string;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}
