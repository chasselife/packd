import { Component, inject, input, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { DatabaseService } from '../../services/database.service';
import { Checklist, ChecklistItem } from '../../models/checklist.model';

@Component({
  selector: 'app-checklist-item',
  standalone: true,
  imports: [CommonModule, MatIconModule, RouterModule],
  templateUrl: './checklist-item.component.html',
})
export class ChecklistItemComponent {
  private databaseService = inject(DatabaseService);
  private router = inject(Router);

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
}
