import { Injectable } from '@angular/core';
import Dexie, { Table } from 'dexie';
import { Checklist, ChecklistItem } from '../models/checklist.model';

class PackForCampDatabase extends Dexie {
  checklists!: Table<Checklist, number>;
  checklistItems!: Table<ChecklistItem, number>;

  constructor() {
    super('PackForCampDB');

    this.version(1).stores({
      checklists: '++id, title, sortOrder, createdAt, updatedAt',
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
    return await this.db.checklists.orderBy('sortOrder').toArray();
  }

  async getChecklist(id: number): Promise<Checklist | undefined> {
    return await this.db.checklists.get(id);
  }

  async createChecklist(
    checklist: Omit<Checklist, 'id' | 'createdAt' | 'updatedAt' | 'sortOrder'>
  ): Promise<number> {
    const now = new Date();
    // Get the maximum sortOrder and add 1 for the new checklist
    const allChecklists = await this.db.checklists.toArray();
    const sortOrders = allChecklists
      .map((c) => c.sortOrder)
      .filter((order): order is number => order !== undefined);
    const maxSortOrder = sortOrders.length > 0 ? Math.max(...sortOrders) : -1;

    return await this.db.checklists.add({
      ...checklist,
      sortOrder: maxSortOrder + 1,
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

  async reorderChecklists(checklistIds: number[]): Promise<void> {
    const updates = checklistIds.map((id, index) => ({
      id,
      sortOrder: index,
    }));

    await this.db.transaction('rw', this.db.checklists, async () => {
      for (const update of updates) {
        await this.db.checklists.update(update.id, {
          sortOrder: update.sortOrder,
          updatedAt: new Date(),
        });
      }
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

  async reorderChecklistItems(itemIds: number[]): Promise<void> {
    const updates = itemIds.map((id, index) => ({
      id,
      sortOrder: index,
    }));

    await this.db.transaction('rw', this.db.checklistItems, async () => {
      for (const update of updates) {
        await this.db.checklistItems.update(update.id, {
          sortOrder: update.sortOrder,
          updatedAt: new Date(),
        });
      }
    });
  }

  async deleteChecklistItemsByChecklistId(checklistId: number): Promise<number> {
    return await this.db.checklistItems.where('checklistId').equals(checklistId).delete();
  }

  // Utility methods
  get database(): PackForCampDatabase {
    return this.db;
  }
}
