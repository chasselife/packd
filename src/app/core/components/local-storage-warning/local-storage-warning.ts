import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { BaseDatabaseService } from '../../services/database.service';

@Component({
  selector: 'app-local-storage-warning',
  standalone: true,
  imports: [CommonModule],
  template: ` @if (showStorageWarning()) {
    <div class="bg-yellow-50 border-b border-yellow-200 px-4 py-3">
      <div class="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div class="flex items-center gap-3 flex-1">
          <svg class="w-5 h-5 text-yellow-600 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path
              fill-rule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clip-rule="evenodd"
            />
          </svg>
          <div class="text-sm text-yellow-800">
            <strong>Limited Storage Mode:</strong> IndexedDB is not available in your browser's
            current mode. Your data is being stored in localStorage, which has size limitations.
            Some features may be restricted.
          </div>
        </div>
        <button
          (click)="dismissStorageWarning()"
          class="text-yellow-600 hover:text-yellow-800 shrink-0"
          aria-label="Dismiss warning"
        >
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fill-rule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clip-rule="evenodd"
            />
          </svg>
        </button>
      </div>
    </div>
    }`,
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LocalStorageWarning {
  private databaseService = inject(BaseDatabaseService);
  showStorageWarning = signal(false);
  dismissStorageWarning(): void {
    this.showStorageWarning.set(false);
  }
  ngOnInit() {
    // Check if using localStorage fallback
    setTimeout(() => {
      this.showStorageWarning.set(this.databaseService.isUsingLocalStorage);
    }, 100);
  }
}
