import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { DatabaseService } from '../../services/database.service';
import { Checklist } from '../../models/checklist.model';

@Component({
  selector: 'app-checklist-list',
  standalone: true,
  imports: [CommonModule, MatIconModule, RouterModule],
  templateUrl: './checklist-list.component.html',
})
export class ChecklistListComponent implements OnInit {
  private databaseService = inject(DatabaseService);
  private router = inject(Router);

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
}
