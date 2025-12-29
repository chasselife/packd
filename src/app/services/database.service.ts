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

// LocalStorage fallback storage
interface LocalStorageData {
  checklists: Checklist[];
  checklistItems: ChecklistItem[];
  nextChecklistId: number;
  nextChecklistItemId: number;
}

@Injectable({
  providedIn: 'root',
})
export class DatabaseService {
  private db: PackForCampDatabase | null = null;
  private useLocalStorage = false;
  private storageKey = 'PackForCampDB';
  private initialized = false;

  constructor() {
    this.initialize();
  }

  private async initialize(): Promise<void> {
    if (this.initialized) return;
    this.initialized = true;

    // Check if IndexedDB is available
    if (!this.isIndexedDBAvailable()) {
      console.warn('IndexedDB is not available. Falling back to localStorage.');
      this.useLocalStorage = true;
      return;
    }

    try {
      this.db = new PackForCampDatabase();
      // Try to open the database to verify it works
      await this.db.open();
    } catch (error) {
      console.error('Failed to initialize IndexedDB:', error);
      console.warn('Falling back to localStorage.');
      this.useLocalStorage = true;
      this.db = null;
    }
  }

  private isIndexedDBAvailable(): boolean {
    try {
      // Check if IndexedDB is available in the window object
      if (typeof window === 'undefined' || !('indexedDB' in window)) {
        return false;
      }
      
      // In some browsers (like Safari in private mode), indexedDB exists but throws when accessed
      try {
        const test = indexedDB.open('__test__');
        test.onerror = () => {
          try {
            indexedDB.deleteDatabase('__test__');
          } catch (e) {
            // Ignore cleanup errors
          }
        };
        test.onsuccess = () => {
          try {
            indexedDB.deleteDatabase('__test__');
          } catch (e) {
            // Ignore cleanup errors
          }
        };
        return true;
      } catch (e) {
        return false;
      }
    } catch (e) {
      return false;
    }
  }

  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }
  }

  // LocalStorage methods
  private getLocalStorageData(): LocalStorageData {
    const data = localStorage.getItem(this.storageKey);
    if (data) {
      try {
        const parsed = JSON.parse(data);
        // Convert date strings back to Date objects
        return {
          checklists: parsed.checklists.map((c: any) => ({
            ...c,
            createdAt: new Date(c.createdAt),
            updatedAt: new Date(c.updatedAt),
          })),
          checklistItems: parsed.checklistItems.map((item: any) => ({
            ...item,
            createdAt: new Date(item.createdAt),
            updatedAt: new Date(item.updatedAt),
          })),
          nextChecklistId: parsed.nextChecklistId || 1,
          nextChecklistItemId: parsed.nextChecklistItemId || 1,
        };
      } catch (e) {
        console.error('Failed to parse localStorage data:', e);
      }
    }
    return {
      checklists: [],
      checklistItems: [],
      nextChecklistId: 1,
      nextChecklistItemId: 1,
    };
  }

  private saveLocalStorageData(data: LocalStorageData): void {
    try {
      // Check if localStorage is available
      if (typeof Storage === 'undefined' || !localStorage) {
        throw new Error('localStorage is not available in this browser.');
      }
      localStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
      if (e instanceof Error && e.message.includes('quota')) {
        throw new Error('Storage quota exceeded. Please free up some space.');
      }
      throw new Error('Failed to save data. Storage may not be available in this browser mode.');
    }
  }

  // Checklist methods
  async getAllChecklists(): Promise<Checklist[]> {
    await this.ensureInitialized();
    if (this.useLocalStorage) {
      const data = this.getLocalStorageData();
      return [...data.checklists].sort((a, b) => a.sortOrder - b.sortOrder);
    }
    if (!this.db) throw new Error('Database not initialized');
    return await this.db.checklists.orderBy('sortOrder').toArray();
  }

  async getChecklist(id: number): Promise<Checklist | undefined> {
    await this.ensureInitialized();
    if (this.useLocalStorage) {
      const data = this.getLocalStorageData();
      return data.checklists.find((c) => c.id === id);
    }
    if (!this.db) throw new Error('Database not initialized');
    return await this.db.checklists.get(id);
  }

  async createChecklist(
    checklist: Omit<Checklist, 'id' | 'createdAt' | 'updatedAt' | 'sortOrder'>
  ): Promise<number> {
    await this.ensureInitialized();
    const now = new Date();
    
    if (this.useLocalStorage) {
      const data = this.getLocalStorageData();
      const sortOrders = data.checklists
        .map((c) => c.sortOrder)
        .filter((order): order is number => order !== undefined);
      const maxSortOrder = sortOrders.length > 0 ? Math.max(...sortOrders) : -1;
      
      const newChecklist: Checklist = {
        ...checklist,
        id: data.nextChecklistId++,
        sortOrder: maxSortOrder + 1,
        createdAt: now,
        updatedAt: now,
      };
      
      data.checklists.push(newChecklist);
      this.saveLocalStorageData(data);
      return newChecklist.id!;
    }
    
    if (!this.db) throw new Error('Database not initialized');
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
    await this.ensureInitialized();
    
    if (this.useLocalStorage) {
      const data = this.getLocalStorageData();
      const index = data.checklists.findIndex((c) => c.id === id);
      if (index === -1) {
        throw new Error(`Checklist with id ${id} not found`);
      }
      data.checklists[index] = {
        ...data.checklists[index],
        ...updates,
        updatedAt: new Date(),
      };
      this.saveLocalStorageData(data);
      return id;
    }
    
    if (!this.db) throw new Error('Database not initialized');
    return await this.db.checklists.update(id, {
      ...updates,
      updatedAt: new Date(),
    });
  }

  async reorderChecklists(checklistIds: number[]): Promise<void> {
    await this.ensureInitialized();
    
    if (this.useLocalStorage) {
      const data = this.getLocalStorageData();
      checklistIds.forEach((id, index) => {
        const checklist = data.checklists.find((c) => c.id === id);
        if (checklist) {
          checklist.sortOrder = index;
          checklist.updatedAt = new Date();
        }
      });
      this.saveLocalStorageData(data);
      return;
    }
    
    if (!this.db) throw new Error('Database not initialized');
    await this.db.transaction('rw', this.db.checklists, async () => {
      for (let index = 0; index < checklistIds.length; index++) {
        await this.db!.checklists.update(checklistIds[index], {
          sortOrder: index,
          updatedAt: new Date(),
        });
      }
    });
  }

  async deleteChecklist(id: number): Promise<void> {
    await this.ensureInitialized();
    
    if (this.useLocalStorage) {
      const data = this.getLocalStorageData();
      // Delete all associated checklist items first
      data.checklistItems = data.checklistItems.filter((item) => item.checklistId !== id);
      // Then delete the checklist
      data.checklists = data.checklists.filter((c) => c.id !== id);
      this.saveLocalStorageData(data);
      return;
    }
    
    if (!this.db) throw new Error('Database not initialized');
    // Delete all associated checklist items first
    await this.db.checklistItems.where('checklistId').equals(id).delete();
    // Then delete the checklist
    await this.db.checklists.delete(id);
  }

  // ChecklistItem methods
  async getChecklistItems(checklistId: number): Promise<ChecklistItem[]> {
    await this.ensureInitialized();
    
    if (this.useLocalStorage) {
      const data = this.getLocalStorageData();
      return data.checklistItems
        .filter((item) => item.checklistId === checklistId)
        .sort((a, b) => a.sortOrder - b.sortOrder);
    }
    
    if (!this.db) throw new Error('Database not initialized');
    return await this.db.checklistItems
      .where('checklistId')
      .equals(checklistId)
      .sortBy('sortOrder');
  }

  async getChecklistItem(id: number): Promise<ChecklistItem | undefined> {
    await this.ensureInitialized();
    
    if (this.useLocalStorage) {
      const data = this.getLocalStorageData();
      return data.checklistItems.find((item) => item.id === id);
    }
    
    if (!this.db) throw new Error('Database not initialized');
    return await this.db.checklistItems.get(id);
  }

  async createChecklistItem(
    item: Omit<ChecklistItem, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<number> {
    await this.ensureInitialized();
    const now = new Date();
    
    if (this.useLocalStorage) {
      const data = this.getLocalStorageData();
      const newItem: ChecklistItem = {
        ...item,
        id: data.nextChecklistItemId++,
        createdAt: now,
        updatedAt: now,
      };
      data.checklistItems.push(newItem);
      this.saveLocalStorageData(data);
      return newItem.id!;
    }
    
    if (!this.db) throw new Error('Database not initialized');
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
    await this.ensureInitialized();
    
    if (this.useLocalStorage) {
      const data = this.getLocalStorageData();
      const index = data.checklistItems.findIndex((item) => item.id === id);
      if (index === -1) {
        throw new Error(`ChecklistItem with id ${id} not found`);
      }
      data.checklistItems[index] = {
        ...data.checklistItems[index],
        ...updates,
        updatedAt: new Date(),
      };
      this.saveLocalStorageData(data);
      return id;
    }
    
    if (!this.db) throw new Error('Database not initialized');
    return await this.db.checklistItems.update(id, {
      ...updates,
      updatedAt: new Date(),
    });
  }

  async deleteChecklistItem(id: number): Promise<void> {
    await this.ensureInitialized();
    
    if (this.useLocalStorage) {
      const data = this.getLocalStorageData();
      data.checklistItems = data.checklistItems.filter((item) => item.id !== id);
      this.saveLocalStorageData(data);
      return;
    }
    
    if (!this.db) throw new Error('Database not initialized');
    await this.db.checklistItems.delete(id);
  }

  async reorderChecklistItems(itemIds: number[]): Promise<void> {
    await this.ensureInitialized();
    
    if (this.useLocalStorage) {
      const data = this.getLocalStorageData();
      itemIds.forEach((id, index) => {
        const item = data.checklistItems.find((item) => item.id === id);
        if (item) {
          item.sortOrder = index;
          item.updatedAt = new Date();
        }
      });
      this.saveLocalStorageData(data);
      return;
    }
    
    if (!this.db) throw new Error('Database not initialized');
    await this.db.transaction('rw', this.db.checklistItems, async () => {
      for (let index = 0; index < itemIds.length; index++) {
        await this.db!.checklistItems.update(itemIds[index], {
          sortOrder: index,
          updatedAt: new Date(),
        });
      }
    });
  }

  async deleteChecklistItemsByChecklistId(checklistId: number): Promise<number> {
    await this.ensureInitialized();
    
    if (this.useLocalStorage) {
      const data = this.getLocalStorageData();
      const initialLength = data.checklistItems.length;
      data.checklistItems = data.checklistItems.filter((item) => item.checklistId !== checklistId);
      this.saveLocalStorageData(data);
      return initialLength - data.checklistItems.length;
    }
    
    if (!this.db) throw new Error('Database not initialized');
    return await this.db.checklistItems.where('checklistId').equals(checklistId).delete();
  }

  // Utility methods
  get database(): PackForCampDatabase {
    if (!this.db) {
      throw new Error('Database not initialized. IndexedDB may not be available.');
    }
    return this.db;
  }

  get isUsingLocalStorage(): boolean {
    return this.useLocalStorage;
  }
}
