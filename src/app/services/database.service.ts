import { Injectable } from '@angular/core';
import Dexie, { Table } from 'dexie';
import { Checklist, ChecklistItem } from '../models/checklist.model';

class PackForCampDatabase extends Dexie {
  checklists!: Table<Checklist, number>;
  checklistItems!: Table<ChecklistItem, number>;

  constructor() {
    super('PackForCampDB');

    this.version(1).stores({
      checklists: '++id, title, createdAt, updatedAt',
      checklistItems: '++id, checklistId, sortOrder, createdAt, updatedAt',
    });
  }
}

@Injectable({
  providedIn: 'root',
})
export class DatabaseService {
  private db: PackForCampDatabase;

  constructor() {
    this.db = new PackForCampDatabase();
  }

  // Checklist methods
  async getAllChecklists(): Promise<Checklist[]> {
    return await this.db.checklists.toArray();
  }

  async getChecklist(id: number): Promise<Checklist | undefined> {
    return await this.db.checklists.get(id);
  }

  async createChecklist(
    checklist: Omit<Checklist, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<number> {
    const now = new Date();
    return await this.db.checklists.add({
      ...checklist,
      createdAt: now,
      updatedAt: now,
    });
  }

  async updateChecklist(
    id: number,
    updates: Partial<Omit<Checklist, 'id' | 'createdAt'>>
  ): Promise<number> {
    return await this.db.checklists.update(id, {
      ...updates,
      updatedAt: new Date(),
    });
  }

  async deleteChecklist(id: number): Promise<void> {
    // Delete all associated checklist items first
    await this.db.checklistItems.where('checklistId').equals(id).delete();
    // Then delete the checklist
    await this.db.checklists.delete(id);
  }

  // ChecklistItem methods
  async getChecklistItems(checklistId: number): Promise<ChecklistItem[]> {
    return await this.db.checklistItems
      .where('checklistId')
      .equals(checklistId)
      .sortBy('sortOrder');
  }

  async getChecklistItem(id: number): Promise<ChecklistItem | undefined> {
    return await this.db.checklistItems.get(id);
  }

  async createChecklistItem(
    item: Omit<ChecklistItem, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<number> {
    const now = new Date();
    return await this.db.checklistItems.add({
      ...item,
      createdAt: now,
      updatedAt: now,
    });
  }

  async updateChecklistItem(
    id: number,
    updates: Partial<Omit<ChecklistItem, 'id' | 'createdAt'>>
  ): Promise<number> {
    return await this.db.checklistItems.update(id, {
      ...updates,
      updatedAt: new Date(),
    });
  }

  async deleteChecklistItem(id: number): Promise<void> {
    await this.db.checklistItems.delete(id);
  }

  async deleteChecklistItemsByChecklistId(checklistId: number): Promise<number> {
    return await this.db.checklistItems.where('checklistId').equals(checklistId).delete();
  }

  // Utility methods
  get database(): PackForCampDatabase {
    return this.db;
  }
}
