import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { DatabaseService } from '../../services/database.service';
import { Checklist } from '../../models/checklist.model';

@Component({
  selector: 'app-checklist-list',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './checklist-list.component.html',
})
export class ChecklistListComponent implements OnInit {
  private databaseService = inject(DatabaseService);

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
    // TODO: Navigate to checklist detail page
    console.log('Clicked checklist:', checklist);
  }
}
