import { Component, inject, input, effect, signal } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import {
  MatDialog,
  MatDialogModule,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { DragDropModule, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { DatabaseService } from '../../services/database.service';
import { Checklist, ChecklistItem } from '../../models/checklist.model';
import { getColorClasses as getColorClassesHelper } from '../../constants/color-options.constant';

@Component({
  selector: 'app-checklist-item',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    RouterModule,
    MatButtonModule,
    MatDialogModule,
    DragDropModule,
  ],
  templateUrl: './checklist-item.component.html',
})
export class ChecklistItemComponent {
  private databaseService = inject(DatabaseService);
  private router = inject(Router);
  private dialog = inject(MatDialog);
  private location = inject(Location);

  id = input.required<string>();

  // LocalStorage keys
  private readonly STORAGE_KEY_LAYOUT_MODE = 'chckd-checklist-layout-mode';
  private readonly STORAGE_KEY_DRAG_DROP = 'chckd-checklist-drag-drop';
  private readonly STORAGE_KEY_SORT_BY_DONE = 'chckd-checklist-sort-by-done';

  checklist = signal<Checklist | undefined>(undefined);
  checklistItems = signal<ChecklistItem[]>([]);
  isLoading = signal(true);
  layoutMode = signal<'compact' | 'full'>(this.loadLayoutMode());
  swipedItemId = signal<number | null>(null);
  dragDropEnabled = signal(this.loadDragDropEnabled());
  sortByDoneEnabled = signal(this.loadSortByDoneEnabled());

  // Swipe gesture tracking
  private touchStartX = 0;
  private touchStartY = 0;
  private isDragging = false;
  private touchStarted = false;
  mouseStarted = false; // Public for template access
  private longPressTimer: ReturnType<typeof setTimeout> | null = null;
  private longPressDuration = 500; // milliseconds

  constructor() {
    // Save to localStorage when signals change
    effect(() => {
      const layoutMode = this.layoutMode();
      this.saveLayoutMode(layoutMode);
    });

    effect(() => {
      const dragDropEnabled = this.dragDropEnabled();
      this.saveDragDropEnabled(dragDropEnabled);
    });

    effect(() => {
      const sortByDoneEnabled = this.sortByDoneEnabled();
      this.saveSortByDoneEnabled(sortByDoneEnabled);
    });

    effect(() => {
      const checklistId = this.id();
      if (checklistId) {
        this.loadChecklistAndItems(Number(checklistId));
      }
    });
  }

  private loadLayoutMode(): 'compact' | 'full' {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY_LAYOUT_MODE);
      if (stored === 'compact' || stored === 'full') {
        return stored;
      }
    } catch (error) {
      console.warn('Error loading layout mode from localStorage:', error);
    }
    return 'full';
  }

  private saveLayoutMode(mode: 'compact' | 'full'): void {
    try {
      localStorage.setItem(this.STORAGE_KEY_LAYOUT_MODE, mode);
    } catch (error) {
      console.warn('Error saving layout mode to localStorage:', error);
    }
  }

  private loadDragDropEnabled(): boolean {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY_DRAG_DROP);
      return stored === 'true';
    } catch (error) {
      console.warn('Error loading drag drop enabled from localStorage:', error);
    }
    return false;
  }

  private saveDragDropEnabled(enabled: boolean): void {
    try {
      localStorage.setItem(this.STORAGE_KEY_DRAG_DROP, String(enabled));
    } catch (error) {
      console.warn('Error saving drag drop enabled to localStorage:', error);
    }
  }

  private loadSortByDoneEnabled(): boolean {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY_SORT_BY_DONE);
      return stored === 'true';
    } catch (error) {
      console.warn('Error loading sort by done enabled from localStorage:', error);
    }
    return false;
  }

  private saveSortByDoneEnabled(enabled: boolean): void {
    try {
      localStorage.setItem(this.STORAGE_KEY_SORT_BY_DONE, String(enabled));
    } catch (error) {
      console.warn('Error saving sort by done enabled to localStorage:', error);
    }
  }

  async loadChecklistAndItems(checklistId: number): Promise<void> {
    try {
      this.isLoading.set(true);
      const [checklist, items] = await Promise.all([
        this.databaseService.getChecklist(checklistId),
        this.databaseService.getChecklistItems(checklistId),
      ]);
      this.checklist.set(checklist);
      this.checklistItems.set(items);
      this.applySorting();
    } catch (error) {
      console.error('Error loading checklist and items:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  async toggleItemDone(item: ChecklistItem): Promise<void> {
    if (!item.id) return;

    try {
      await this.databaseService.updateChecklistItem(item.id, {
        isDone: !item.isDone,
      });
      // Update the local state
      this.checklistItems.update((items) =>
        items.map((i) => (i.id === item.id ? { ...i, isDone: !i.isDone } : i))
      );
      this.applySorting();
    } catch (error) {
      console.error('Error toggling item:', error);
    }
  }

  goBack(): void {
    if (window.history.length > 1) {
      this.location.back();
    } else {
      this.router.navigate(['/']);
    }
  }

  openNewItemDialog(): void {
    const checklistId = this.id();
    if (checklistId) {
      this.router.navigate(['/checklist', checklistId, 'item', 'new']);
    }
  }

  openEditItemDialog(item: ChecklistItem): void {
    const checklistId = this.id();
    if (checklistId && item.id) {
      this.router.navigate(['/checklist', checklistId, 'item', item.id, 'edit']);
    }
  }

  async deleteItem(item: ChecklistItem): Promise<void> {
    if (!item.id) return;

    const dialogRef = this.dialog.open(ConfirmDeleteDialogComponent, {
      width: '400px',
      data: {
        title: item.title,
      },
    });

    dialogRef.afterClosed().subscribe(async (confirmed) => {
      if (confirmed) {
        try {
          await this.databaseService.deleteChecklistItem(item.id!);

          // Reload items
          const checklistId = Number(this.id());
          if (checklistId) {
            await this.loadChecklistAndItems(checklistId);
          }
        } catch (error) {
          console.error('Error deleting item:', error);
        }
      }
    });
  }

  async onItemDrop(event: CdkDragDrop<ChecklistItem[]>): Promise<void> {
    const items = this.checklistItems();
    moveItemInArray(items, event.previousIndex, event.currentIndex);
    this.checklistItems.set([...items]);

    // Update sortOrder in database
    const itemIds = items.map((item) => item.id!).filter((id): id is number => id !== undefined);
    try {
      await this.databaseService.reorderChecklistItems(itemIds);
    } catch (error) {
      console.error('Error reordering items:', error);
      // Reload items on error to restore original order
      const checklistId = Number(this.id());
      if (checklistId) {
        await this.loadChecklistAndItems(checklistId);
      }
    }
  }

  setLayoutMode(mode: 'compact' | 'full'): void {
    this.layoutMode.set(mode);
  }

  toggleDragDrop(): void {
    this.dragDropEnabled.update((enabled) => !enabled);
    // If enabling drag drop, disable sort by done and reset sorting to sortOrder
    if (this.dragDropEnabled()) {
      this.sortByDoneEnabled.set(false);
      this.applySorting(); // Reset to sortOrder-based sorting
    }
    // Close any swiped items when toggling drag drop
    if (this.dragDropEnabled()) {
      this.swipedItemId.set(null);
    }
    // Clear any pending long press timer
    this.clearLongPressTimer();
  }

  toggleSortByDone(): void {
    this.sortByDoneEnabled.update((enabled) => !enabled);
    // If enabling sort by done, disable drag drop
    if (this.sortByDoneEnabled()) {
      this.dragDropEnabled.set(false);
    }
    this.applySorting();
  }

  private applySorting(): void {
    if (this.sortByDoneEnabled()) {
      this.checklistItems.update((items) => {
        // Create a copy to avoid mutating the original
        const sorted = [...items];
        // Sort by isDone first (false before true), then by sortOrder
        sorted.sort((a, b) => {
          // First, separate done and undone items
          if (a.isDone !== b.isDone) {
            return a.isDone ? 1 : -1; // undone items (false) come first
          }
          // Within the same done state, sort by sortOrder
          return a.sortOrder - b.sortOrder;
        });
        return sorted;
      });
    } else {
      // When sort by done is disabled, restore original order by sortOrder
      this.checklistItems.update((items) => {
        const sorted = [...items];
        sorted.sort((a, b) => a.sortOrder - b.sortOrder);
        return sorted;
      });
    }
  }

  onTouchStart(event: TouchEvent, item: ChecklistItem): void {
    // Don't interfere with CDK drag when drag and drop is enabled
    if (this.dragDropEnabled()) {
      this.touchStarted = false;
      return;
    }

    if (!event.touches || event.touches.length === 0) return;

    this.touchStartX = event.touches[0].clientX;
    this.touchStartY = event.touches[0].clientY;
    this.isDragging = false;
    this.touchStarted = true;
    this.startLongPressTimer(item);
    event.stopPropagation();
  }

  onTouchMove(event: TouchEvent, item: ChecklistItem): void {
    // Don't interfere with CDK drag when drag and drop is enabled
    if (this.dragDropEnabled() || !this.touchStarted) return;

    if (!event.touches || event.touches.length === 0) return;

    const deltaX = event.touches[0].clientX - this.touchStartX;
    const deltaY = Math.abs(event.touches[0].clientY - this.touchStartY);

    // Clear long press timer if there's significant movement
    if (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10) {
      this.clearLongPressTimer();
    }

    // Determine if this is a horizontal swipe (not vertical drag)
    // Only allow swipe if horizontal movement is significantly more than vertical
    if (Math.abs(deltaX) > 10 && Math.abs(deltaX) > deltaY * 1.5) {
      this.isDragging = true;
      // Only prevent default when we've confirmed it's a horizontal swipe
      // This allows vertical scrolling to work normally
      event.preventDefault();
      event.stopPropagation();
    } else if (Math.abs(deltaY) > Math.abs(deltaX)) {
      // If vertical movement is greater, it's a scroll - don't interfere
      this.touchStarted = false;
      this.isDragging = false;
    }
  }

  onTouchEnd(event: TouchEvent, item: ChecklistItem): void {
    // Clear long press timer
    this.clearLongPressTimer();

    // Don't interfere with CDK drag when drag and drop is enabled
    if (this.dragDropEnabled() || !this.touchStarted) {
      this.touchStarted = false;
      this.isDragging = false;
      return;
    }

    if (!event.changedTouches || event.changedTouches.length === 0) {
      this.touchStarted = false;
      this.isDragging = false;
      return;
    }

    const deltaX = event.changedTouches[0].clientX - this.touchStartX;
    const threshold = 80; // Minimum swipe distance

    if (this.isDragging && deltaX < -threshold) {
      // Swiped left - reveal buttons
      if (item.id) {
        this.swipedItemId.set(item.id);
      }
    } else if (this.isDragging && deltaX > threshold) {
      // Swiped right - hide buttons
      this.swipedItemId.set(null);
    } else if (this.isDragging) {
      // Didn't swipe far enough - snap back
      this.swipedItemId.set(null);
    }

    this.isDragging = false;
    this.touchStarted = false;
    event.stopPropagation();
  }

  onMouseDown(event: MouseEvent, item: ChecklistItem): void {
    // Don't interfere with CDK drag when drag and drop is enabled
    if (this.dragDropEnabled()) {
      this.mouseStarted = false;
      return;
    }
    // Don't start if clicking on buttons or interactive elements
    const target = event.target as HTMLElement;
    if (target.closest('button') || target.closest('mat-icon-button')) {
      this.mouseStarted = false;
      return;
    }

    this.touchStartX = event.clientX;
    this.touchStartY = event.clientY;
    this.isDragging = false;
    this.mouseStarted = true;
    this.currentSwipingItem = item;
    this.startLongPressTimer(item);

    // Add global mouse move and up listeners
    document.addEventListener('mousemove', this.onDocumentMouseMove);
    document.addEventListener('mouseup', this.onDocumentMouseUp);

    event.preventDefault();
    event.stopPropagation();
  }

  private currentSwipingItem: ChecklistItem | null = null;
  private onDocumentMouseMove = (event: MouseEvent) => {
    if (!this.mouseStarted || !this.currentSwipingItem) return;
    this.onMouseMove(event, this.currentSwipingItem);
  };

  private onDocumentMouseUp = (event: MouseEvent) => {
    if (!this.mouseStarted || !this.currentSwipingItem) return;
    this.onMouseUp(event, this.currentSwipingItem);
    // Clean up listeners
    document.removeEventListener('mousemove', this.onDocumentMouseMove);
    document.removeEventListener('mouseup', this.onDocumentMouseUp);
    this.currentSwipingItem = null;
  };

  onMouseMove(event: MouseEvent, item: ChecklistItem): void {
    // Don't interfere with CDK drag when drag and drop is enabled
    if (this.dragDropEnabled() || !this.mouseStarted) return;

    const deltaX = event.clientX - this.touchStartX;
    const deltaY = Math.abs(event.clientY - this.touchStartY);

    // Clear long press timer if there's significant movement
    if (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10) {
      this.clearLongPressTimer();
    }

    // Determine if this is a horizontal swipe (not vertical drag)
    // Only allow swipe if horizontal movement is significantly more than vertical
    if (Math.abs(deltaX) > 10 && Math.abs(deltaX) > deltaY * 1.5) {
      this.isDragging = true;
      // Update transform in real-time during drag
      // We'll handle the transform via the style binding, but we can also update swipedItemId for visual feedback
      if (deltaX < -20) {
        if (item.id && !this.isItemSwiped(item)) {
          this.swipedItemId.set(item.id);
        }
      }
      event.preventDefault();
      event.stopPropagation();
    }
  }

  onMouseUp(event: MouseEvent, item: ChecklistItem): void {
    // Clear long press timer
    this.clearLongPressTimer();

    // Don't interfere with CDK drag when drag and drop is enabled
    if (this.dragDropEnabled() || !this.mouseStarted) {
      this.mouseStarted = false;
      this.isDragging = false;
      this.currentSwipingItem = null;
      // Clean up listeners
      document.removeEventListener('mousemove', this.onDocumentMouseMove);
      document.removeEventListener('mouseup', this.onDocumentMouseUp);
      return;
    }

    const deltaX = event.clientX - this.touchStartX;
    const threshold = 80; // Minimum swipe distance

    if (this.isDragging && deltaX < -threshold) {
      // Swiped left - reveal buttons
      if (item.id) {
        this.swipedItemId.set(item.id);
      }
    } else if (this.isDragging && deltaX > threshold) {
      // Swiped right - hide buttons
      this.swipedItemId.set(null);
    } else if (this.isDragging) {
      // Didn't swipe far enough - snap back
      this.swipedItemId.set(null);
    } else {
      // If we didn't drag, it was just a click - don't change swipe state
      // But reset the flag
    }

    this.isDragging = false;
    this.mouseStarted = false;
    this.currentSwipingItem = null;
    // Clean up listeners
    document.removeEventListener('mousemove', this.onDocumentMouseMove);
    document.removeEventListener('mouseup', this.onDocumentMouseUp);
    event.stopPropagation();
  }

  onMouseLeave(): void {
    // Reset mouse drag state when mouse leaves the element
    if (this.mouseStarted && !this.isDragging) {
      this.mouseStarted = false;
    }
  }

  closeSwipe(): void {
    this.swipedItemId.set(null);
  }

  isItemSwiped(item: ChecklistItem): boolean {
    return item.id !== undefined && this.swipedItemId() === item.id;
  }

  private clearLongPressTimer(): void {
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
      this.longPressTimer = null;
    }
  }

  private startLongPressTimer(item: ChecklistItem): void {
    this.clearLongPressTimer();
    this.longPressTimer = setTimeout(() => {
      // Long press detected - mark item as swiped
      if (item.id && !this.dragDropEnabled()) {
        this.swipedItemId.set(item.id);
      }
      this.longPressTimer = null;
    }, this.longPressDuration);
  }

  getColorClasses(color?: string): {
    bgClass: string;
    borderClass: string;
    textClass: string;
    buttonClass: string;
  } {
    return getColorClassesHelper(color, true) as {
      bgClass: string;
      borderClass: string;
      textClass: string;
      buttonClass: string;
    };
  }
  resetChecklistItems(): void {
    const checklistId = Number(this.id());
    this.databaseService.resetChecklistItemsByChecklistId(checklistId).then(() => {
      this.loadChecklistAndItems(checklistId);
    });
  }
}

// Simple confirmation dialog component
@Component({
  selector: 'app-confirm-delete-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>Delete Checklist Item</h2>
    <mat-dialog-content>
      <p>Are you sure you want to delete "{{ data.title }}"?</p>
      <p class="text-sm text-gray-600">This action cannot be undone.</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <div class="mb-2">
        <button mat-button class="h-10!" (click)="onCancel()">Cancel</button>
        <button mat-raised-button class="h-10!" color="warn" (click)="onConfirm()">Delete</button>
      </div>
    </mat-dialog-actions>
  `,
})
export class ConfirmDeleteDialogComponent {
  dialogRef = inject(MatDialogRef<ConfirmDeleteDialogComponent>);
  data = inject<{ title: string }>(MAT_DIALOG_DATA);

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }
}
