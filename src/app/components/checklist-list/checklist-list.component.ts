import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { DatabaseService } from '../../services/database.service';
import { Checklist } from '../../models/checklist.model';
import { NewChecklistDialogComponent } from '../new-checklist-dialog/new-checklist-dialog.component';
import { ConfirmDeleteDialogComponent } from '../confirm-delete-dialog/confirm-delete-dialog.component';

@Component({
  selector: 'app-checklist-list',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, MatDialogModule, RouterModule],
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
      this.checklists.set(allChecklists);
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
      width: '500px',
    });

    dialogRef.afterClosed().subscribe(async (result) => {
      if (result) {
        try {
          const checklistId = await this.databaseService.createChecklist({
            title: result.title,
            icon: result.icon,
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

  openEditChecklistDialog(checklist: Checklist): void {
    const dialogRef = this.dialog.open(NewChecklistDialogComponent, {
      width: '500px',
      data: { checklist },
    });

    dialogRef.afterClosed().subscribe(async (result) => {
      if (result && checklist.id) {
        try {
          await this.databaseService.updateChecklist(checklist.id, {
            title: result.title,
            icon: result.icon,
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
}
