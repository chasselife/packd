import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class BaseDatabaseService {
  protected useLocalStorage = false;
  protected initialized = false;

  constructor() {
    this.initialize();
  }

  protected async initialize(): Promise<void> {
    if (this.initialized) return;

    // Check if IndexedDB is available
    if (!this.isIndexedDBAvailable()) {
      console.warn('IndexedDB is not available. Falling back to localStorage.');
      this.useLocalStorage = true;
      return;
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

  get isUsingLocalStorage(): boolean {
    return this.useLocalStorage;
  }
}
