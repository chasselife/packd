import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { DragDropModule, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { DatabaseService } from '../../services/database.service';
import { Checklist } from '../../models/checklist.model';
import { NewChecklistDialogComponent } from '../new-checklist-dialog/new-checklist-dialog.component';
import { ConfirmDeleteDialogComponent } from '../confirm-delete-dialog/confirm-delete-dialog.component';

@Component({
  selector: 'app-checklist-list',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatDialogModule,
    RouterModule,
    DragDropModule,
  ],
  templateUrl: './checklist-list.component.html',
})
export class ChecklistListComponent implements OnInit {
  private databaseService = inject(DatabaseService);
  private router = inject(Router);
  private dialog = inject(MatDialog);

  checklists = signal<Checklist[]>([]);
  isLoading = signal(true);
  isEditMode = signal(false);

  private longPressTimer: number | null = null;
  private readonly LONG_PRESS_DURATION = 500; // milliseconds

  async ngOnInit(): Promise<void> {
    await this.loadChecklists();
  }

  async loadChecklists(): Promise<void> {
    try {
      this.isLoading.set(true);
      const allChecklists = await this.databaseService.getAllChecklists();
      // Ensure all checklists have sortOrder (migration for existing data)
      const checklistsNeedingMigration = allChecklists.filter((c) => c.sortOrder === undefined);
      if (checklistsNeedingMigration.length > 0) {
        // Migrate checklists without sortOrder
        const maxSortOrder = allChecklists
          .filter((c) => c.sortOrder !== undefined)
          .reduce((max, c) => Math.max(max, c.sortOrder!), -1);

        for (let i = 0; i < checklistsNeedingMigration.length; i++) {
          const checklist = checklistsNeedingMigration[i];
          if (checklist.id) {
            await this.databaseService.updateChecklist(checklist.id, {
              sortOrder: maxSortOrder + 1 + i,
            });
          }
        }
        // Reload after migration
        const migratedChecklists = await this.databaseService.getAllChecklists();
        this.checklists.set(migratedChecklists);
      } else {
        this.checklists.set(allChecklists);
      }
    } catch (error) {
      console.error('Error loading checklists:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  onChecklistClick(checklist: Checklist): void {
    if (checklist.id) {
      this.router.navigate(['/checklist', checklist.id]);
    }
  }

  openNewChecklistDialog(): void {
    const dialogRef = this.dialog.open(NewChecklistDialogComponent, {
      width: '100vw',
      height: '100vh',
      maxWidth: '100vw',
      maxHeight: '100vh',
      panelClass: 'full-screen-dialog',
    });

    dialogRef.afterClosed().subscribe(async (result) => {
      if (result) {
        try {
          const checklistId = await this.databaseService.createChecklist({
            title: result.title,
            icon: result.icon,
            color: result.color,
          });
          // Reload checklists to show the new one
          await this.loadChecklists();
          // Navigate to the new checklist
          this.router.navigate(['/checklist', checklistId]);
        } catch (error) {
          console.error('Error creating checklist:', error);
        }
      }
    });
  }

  onTileMouseDown(checklist: Checklist, event: MouseEvent | TouchEvent): void {
    if (this.isEditMode()) {
      return; // Don't trigger long press in edit mode
    }

    // Only prevent default on touch events to avoid scrolling during long press
    if (event instanceof TouchEvent) {
      event.preventDefault();
    }

    this.longPressTimer = window.setTimeout(() => {
      this.activateEditMode();
      this.longPressTimer = null;
    }, this.LONG_PRESS_DURATION);
  }

  onTileMouseUp(event: MouseEvent | TouchEvent): void {
    if (this.longPressTimer !== null) {
      clearTimeout(this.longPressTimer);
      this.longPressTimer = null;
    }
  }

  onTileMouseLeave(): void {
    if (this.longPressTimer !== null) {
      clearTimeout(this.longPressTimer);
      this.longPressTimer = null;
    }
  }

  activateEditMode(): void {
    this.isEditMode.set(true);
  }

  deactivateEditMode(): void {
    this.isEditMode.set(false);
  }

  onEditClick(checklist: Checklist, event: Event): void {
    event.stopPropagation();
    this.openEditChecklistDialog(checklist);
  }

  onDeleteClick(checklist: Checklist, event: Event): void {
    event.stopPropagation();
    this.openDeleteChecklistDialog(checklist);
  }

  onDuplicateClick(checklist: Checklist, event: Event): void {
    event.stopPropagation();
    this.openDuplicateChecklistDialog(checklist);
  }

  openEditChecklistDialog(checklist: Checklist): void {
    const dialogRef = this.dialog.open(NewChecklistDialogComponent, {
      width: '100vw',
      height: '100vh',
      maxWidth: '100vw',
      maxHeight: '100vh',
      data: { checklist },
    });

    dialogRef.afterClosed().subscribe(async (result) => {
      if (result && checklist.id) {
        try {
          await this.databaseService.updateChecklist(checklist.id, {
            title: result.title,
            icon: result.icon,
            color: result.color,
          });
          // Reload checklists to show the updated one
          await this.loadChecklists();
        } catch (error) {
          console.error('Error updating checklist:', error);
        }
      }
    });
  }

  openDeleteChecklistDialog(checklist: Checklist): void {
    const dialogRef = this.dialog.open(ConfirmDeleteDialogComponent, {
      width: '400px',
      data: {
        title: checklist.title,
      },
    });

    dialogRef.afterClosed().subscribe(async (confirmed) => {
      if (confirmed && checklist.id) {
        try {
          await this.databaseService.deleteChecklist(checklist.id);
          // Reload checklists to remove the deleted one
          await this.loadChecklists();
          // Exit edit mode if no checklists remain
          if (this.checklists().length === 0) {
            this.deactivateEditMode();
          }
        } catch (error) {
          console.error('Error deleting checklist:', error);
        }
      }
    });
  }

  async openDuplicateChecklistDialog(checklist: Checklist): Promise<void> {
    if (!checklist.id) return;

    try {
      // Get all items for the checklist
      const items = await this.databaseService.getChecklistItems(checklist.id);

      // Open the dialog in duplicate mode
      const dialogRef = this.dialog.open(NewChecklistDialogComponent, {
        width: '100vw',
        height: '100vh',
        maxWidth: '100vw',
        maxHeight: '100vh',
        data: { checklist, isDuplicate: true, items },
      });

      dialogRef.afterClosed().subscribe(async (result) => {
        if (result) {
          try {
            // Create the duplicated checklist
            const newChecklistId = await this.databaseService.createChecklist({
              title: result.title,
              icon: result.icon,
              color: result.color,
            });

            // Duplicate all items
            if (items.length > 0) {
              for (const item of items) {
                await this.databaseService.createChecklistItem({
                  checklistId: newChecklistId,
                  title: item.title,
                  description: item.description || '',
                  icon: item.icon || '',
                  isDone: false, // Reset isDone for duplicated items
                  sortOrder: item.sortOrder,
                });
              }
            }

            // Reload checklists to show the new one
            await this.loadChecklists();
            // Navigate to the duplicated checklist
            this.router.navigate(['/checklist', newChecklistId]);
          } catch (error) {
            console.error('Error duplicating checklist:', error);
          }
        }
      });
    } catch (error) {
      console.error('Error loading checklist items for duplication:', error);
    }
  }

  onDrop(event: CdkDragDrop<Checklist[]>): void {
    if (!this.isEditMode()) {
      return; // Only allow reordering in edit mode
    }

    const currentChecklists = [...this.checklists()];
    moveItemInArray(currentChecklists, event.previousIndex, event.currentIndex);
    this.checklists.set(currentChecklists);

    // Persist the new order to the database
    const checklistIds = currentChecklists.map((c) => c.id!).filter((id) => id !== undefined);
    if (checklistIds.length > 0) {
      this.databaseService.reorderChecklists(checklistIds).catch((error) => {
        console.error('Error reordering checklists:', error);
        // Reload checklists on error to restore correct order
        this.loadChecklists();
      });
    }
  }

  getColorClasses(color?: string): { bgClass: string; borderClass: string; textClass: string } {
    const defaultColor = {
      bgClass: 'bg-emerald-500/20',
      borderClass: 'border-emerald-700',
      textClass: 'text-emerald-700',
    };

    if (!color) return defaultColor;

    const colorMap: Record<string, { bgClass: string; borderClass: string; textClass: string }> = {
      '#53b87d': {
        bgClass: 'bg-emerald-500/20',
        borderClass: 'border-emerald-700',
        textClass: 'text-emerald-700',
      },
      '#3b82f6': {
        bgClass: 'bg-blue-500/20',
        borderClass: 'border-blue-700',
        textClass: 'text-blue-700',
      },
      '#8b5cf6': {
        bgClass: 'bg-purple-500/20',
        borderClass: 'border-purple-700',
        textClass: 'text-purple-700',
      },
      '#ec4899': {
        bgClass: 'bg-pink-500/20',
        borderClass: 'border-pink-700',
        textClass: 'text-pink-700',
      },
      '#f59e0b': {
        bgClass: 'bg-amber-500/20',
        borderClass: 'border-amber-700',
        textClass: 'text-amber-700',
      },
      '#10b981': {
        bgClass: 'bg-green-500/20',
        borderClass: 'border-green-700',
        textClass: 'text-green-700',
      },
      '#06b6d4': {
        bgClass: 'bg-cyan-500/20',
        borderClass: 'border-cyan-700',
        textClass: 'text-cyan-700',
      },
      '#f97316': {
        bgClass: 'bg-orange-500/20',
        borderClass: 'border-orange-700',
        textClass: 'text-orange-700',
      },
      '#6366f1': {
        bgClass: 'bg-indigo-500/20',
        borderClass: 'border-indigo-700',
        textClass: 'text-indigo-700',
      },
      '#14b8a6': {
        bgClass: 'bg-teal-500/20',
        borderClass: 'border-teal-700',
        textClass: 'text-teal-700',
      },
    };

    return colorMap[color] || defaultColor;
  }
}
