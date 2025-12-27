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
      width: '500px',
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
      width: '500px',
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
