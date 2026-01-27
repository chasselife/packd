import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Router } from '@angular/router';
import { FooterComponent } from '../../../core/components/footer/footer.component';
import { getColorClasses } from '../../../core/constants/color-options.constant';
import { ChecklistGroup } from '../../models/checklist-group.model';
import { Checklist } from '../../models/checklist.model';
import { DatabaseService } from '../../services/database.service';
import { ChecklistTileComponent } from '../checklist-tile/checklist-tile.component';

type ChecklistItemWithType =
  | (Checklist & { isGroup: false })
  | (ChecklistGroup & { isGroup: true });

@Component({
  selector: 'app-search-checklist',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    ChecklistTileComponent,
    FooterComponent,
  ],
  templateUrl: './search-checklist.component.html',
  styles: [],
})
export class SearchChecklistComponent implements OnInit {
  private databaseService = inject(DatabaseService);
  private router = inject(Router);

  searchQuery = signal<string>('');
  allChecklists = signal<Checklist[]>([]);
  allGroups = signal<ChecklistGroup[]>([]);
  isLoading = signal(true);

  // Combined items with isGroup flag
  allItems = signal<ChecklistItemWithType[]>([]);

  // Filtered results based on search query
  filteredResults = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) {
      return [];
    }

    return this.allItems().filter((item) => {
      const titleMatch = item.title.toLowerCase().includes(query);
      const descriptionMatch = item.description?.toLowerCase().includes(query) || false;
      return titleMatch || descriptionMatch;
    });
  });

  async ngOnInit(): Promise<void> {
    await this.loadAllData();
  }

  async loadAllData(): Promise<void> {
    try {
      this.isLoading.set(true);
      // Load all checklists (including grouped ones)
      const allChecklists = await this.databaseService.getAllChecklists();
      this.allChecklists.set(allChecklists);

      // Load all groups
      const allGroups = await this.databaseService.getAllChecklistGroups();
      this.allGroups.set(allGroups);

      // Create combined array with isGroup flag
      const combinedItems: ChecklistItemWithType[] = [
        ...allGroups.map((g) => ({ ...g, isGroup: true as const })),
        ...allChecklists.map((c) => ({ ...c, isGroup: false as const })),
      ];

      this.allItems.set(combinedItems);
    } catch (error) {
      console.error('Error loading data for search:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  onSearchInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchQuery.set(input.value);
  }

  onChecklistClick(checklist: Checklist): void {
    if (checklist.id) {
      this.router.navigate(['/chckd/checklist', checklist.id]);
    }
  }

  onChecklistGroupClick(group: ChecklistGroup): void {
    if (group.id) {
      this.router.navigate(['/chckd/checklist-group', group.id]);
    }
  }

  getColorClasses(color?: string): { bgClass: string; borderClass: string; textClass: string } {
    return getColorClasses(color, false);
  }

  getGroupChecklistCount(groupId?: number): number {
    if (!groupId) return 0;
    return this.allChecklists().filter((c) => c.groupId === groupId).length;
  }

  onTileClick(item: Checklist | ChecklistGroup | ChecklistItemWithType): void {
    // Check if it's a group - first check if it has the isGroup flag, otherwise check allGroups
    const isGroup =
      (item as ChecklistItemWithType).isGroup === true ||
      this.allGroups().some((g) => g.id === item.id);
    if (isGroup) {
      this.onChecklistGroupClick(item as ChecklistGroup);
    } else {
      this.onChecklistClick(item as Checklist);
    }
  }

  goBack(): void {
    this.router.navigate(['/chckd']);
  }
}
