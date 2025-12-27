import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { DatabaseService } from '../../services/database.service';
import { Checklist } from '../../models/checklist.model';
import { NewChecklistDialogComponent } from '../new-checklist-dialog/new-checklist-dialog.component';

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
}
