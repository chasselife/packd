import { Component, inject, input, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import {
  MatDialog,
  MatDialogModule,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { DatabaseService } from '../../services/database.service';
import { Checklist, ChecklistItem } from '../../models/checklist.model';
import { NewChecklistItemDialogComponent } from '../new-checklist-item-dialog/new-checklist-item-dialog.component';

@Component({
  selector: 'app-checklist-item',
  standalone: true,
  imports: [CommonModule, MatIconModule, RouterModule, MatButtonModule, MatDialogModule],
  templateUrl: './checklist-item.component.html',
})
export class ChecklistItemComponent {
  private databaseService = inject(DatabaseService);
  private router = inject(Router);
  private dialog = inject(MatDialog);

  id = input.required<string>();

  checklist = signal<Checklist | undefined>(undefined);
  checklistItems = signal<ChecklistItem[]>([]);
  isLoading = signal(true);

  constructor() {
    effect(() => {
      const checklistId = this.id();
      if (checklistId) {
        this.loadChecklistAndItems(Number(checklistId));
      }
    });
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
    } catch (error) {
      console.error('Error toggling item:', error);
    }
  }

  goBack(): void {
    this.router.navigate(['/']);
  }

  openNewItemDialog(): void {
    const dialogRef = this.dialog.open(NewChecklistItemDialogComponent, {
      width: '100vw',
      height: '100vh',
      maxWidth: '100vw',
      maxHeight: '100vh',
      panelClass: 'full-screen-dialog',
      data: {},
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.createItem(result);
      }
    });
  }

  openEditItemDialog(item: ChecklistItem): void {
    const dialogRef = this.dialog.open(NewChecklistItemDialogComponent, {
      width: '100vw',
      height: '100vh',
      maxWidth: '100vw',
      maxHeight: '100vh',
      data: { item },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result && item.id) {
        this.updateItem(item.id, result);
      }
    });
  }

  async createItem(formData: {
    title: string;
    description?: string;
    icon?: string;
  }): Promise<void> {
    const checklistId = Number(this.id());
    if (!checklistId) return;

    try {
      // Get current items to determine sort order
      const currentItems = this.checklistItems();
      const maxSortOrder =
        currentItems.length > 0 ? Math.max(...currentItems.map((item) => item.sortOrder)) : -1;

      await this.databaseService.createChecklistItem({
        checklistId,
        title: formData.title,
        description: formData.description || '',
        icon: formData.icon || '',
        isDone: false,
        sortOrder: maxSortOrder + 1,
      });

      // Reload items
      await this.loadChecklistAndItems(checklistId);
    } catch (error) {
      console.error('Error creating item:', error);
    }
  }

  async updateItem(
    itemId: number,
    formData: { title: string; description?: string; icon?: string }
  ): Promise<void> {
    try {
      await this.databaseService.updateChecklistItem(itemId, {
        title: formData.title,
        description: formData.description || '',
        icon: formData.icon || '',
      });

      // Reload items
      const checklistId = Number(this.id());
      if (checklistId) {
        await this.loadChecklistAndItems(checklistId);
      }
    } catch (error) {
      console.error('Error updating item:', error);
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

  getColorClasses(color?: string): {
    bgClass: string;
    borderClass: string;
    textClass: string;
    buttonClass: string;
  } {
    const defaultColor = {
      bgClass: 'bg-emerald-500/20',
      borderClass: 'border-emerald-500',
      textClass: 'text-emerald-800',
      buttonClass: 'bg-emerald-500/30 hover:bg-emerald-500/40',
    };

    if (!color) return defaultColor;

    const colorMap: Record<
      string,
      { bgClass: string; borderClass: string; textClass: string; buttonClass: string }
    > = {
      '#53b87d': {
        bgClass: 'bg-emerald-500/20',
        borderClass: 'border-emerald-500',
        textClass: 'text-emerald-800',
        buttonClass: 'bg-emerald-500/30 hover:bg-emerald-500/40',
      },
      '#3b82f6': {
        bgClass: 'bg-blue-500/20',
        borderClass: 'border-blue-500',
        textClass: 'text-blue-800',
        buttonClass: 'bg-blue-500/30 hover:bg-blue-500/40',
      },
      '#8b5cf6': {
        bgClass: 'bg-purple-500/20',
        borderClass: 'border-purple-500',
        textClass: 'text-purple-800',
        buttonClass: 'bg-purple-500/30 hover:bg-purple-500/40',
      },
      '#ec4899': {
        bgClass: 'bg-pink-500/20',
        borderClass: 'border-pink-500',
        textClass: 'text-pink-800',
        buttonClass: 'bg-pink-500/30 hover:bg-pink-500/40',
      },
      '#f59e0b': {
        bgClass: 'bg-amber-500/20',
        borderClass: 'border-amber-500',
        textClass: 'text-amber-800',
        buttonClass: 'bg-amber-500/30 hover:bg-amber-500/40',
      },
      '#10b981': {
        bgClass: 'bg-green-500/20',
        borderClass: 'border-green-500',
        textClass: 'text-green-800',
        buttonClass: 'bg-green-500/30 hover:bg-green-500/40',
      },
      '#06b6d4': {
        bgClass: 'bg-cyan-500/20',
        borderClass: 'border-cyan-500',
        textClass: 'text-cyan-800',
        buttonClass: 'bg-cyan-500/30 hover:bg-cyan-500/40',
      },
      '#f97316': {
        bgClass: 'bg-orange-500/20',
        borderClass: 'border-orange-500',
        textClass: 'text-orange-800',
        buttonClass: 'bg-orange-500/30 hover:bg-orange-500/40',
      },
      '#6366f1': {
        bgClass: 'bg-indigo-500/20',
        borderClass: 'border-indigo-500',
        textClass: 'text-indigo-800',
        buttonClass: 'bg-indigo-500/30 hover:bg-indigo-500/40',
      },
      '#14b8a6': {
        bgClass: 'bg-teal-500/20',
        borderClass: 'border-teal-500',
        textClass: 'text-teal-800',
        buttonClass: 'bg-teal-500/30 hover:bg-teal-500/40',
      },
    };

    return colorMap[color] || defaultColor;
  }
}

// Simple confirmation dialog component
@Component({
  selector: 'app-confirm-delete-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>Delete Item</h2>
    <mat-dialog-content>
      <p>Are you sure you want to delete "{{ data.title }}"?</p>
      <p class="text-sm text-gray-600">This action cannot be undone.</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <div class="mb-4 mr-4">
        <button mat-button (click)="onCancel()">Cancel</button>
        <button mat-raised-button color="warn" (click)="onConfirm()">Delete</button>
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
