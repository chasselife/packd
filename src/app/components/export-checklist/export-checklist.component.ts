import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { DatabaseService } from '../../services/database.service';
import { getColorClasses } from '../../constants/color-options.constant';
import { Checklist, ChecklistItem } from '../../models/checklist.model';
import { ChecklistGroup } from '../../models/checklist-group.model';

@Component({
  selector: 'app-export-checklist',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatProgressBarModule,
  ],
  templateUrl: './export-checklist.component.html',
})
export class ExportChecklistComponent implements OnInit {
  private databaseService = inject(DatabaseService);
  private router = inject(Router);

  checklistGroups = signal<ChecklistGroup[]>([]);
  ungroupedChecklists = signal<Checklist[]>([]);
  isLoading = signal(true);
  isExporting = signal(false);
  exportSuccess = signal(false);

  // Selection state
  selectedGroupIds = signal<Set<number>>(new Set());
  selectedChecklistIds = signal<Set<number>>(new Set());

  // Map to store checklist counts for each group
  groupChecklistCounts = signal<Map<number, number>>(new Map());

  async ngOnInit(): Promise<void> {
    await this.loadData();
    // Select all by default
    this.selectAll();
  }

  async loadData(): Promise<void> {
    try {
      this.isLoading.set(true);
      // Load groups
      const allGroups = await this.databaseService.getAllChecklistGroups();
      this.checklistGroups.set(allGroups);

      // Load checklist counts for each group
      const countsMap = new Map<number, number>();
      for (const group of allGroups) {
        if (group.id) {
          const checklistsInGroup = await this.databaseService.getChecklistsByGroupId(group.id);
          countsMap.set(group.id, checklistsInGroup.length);
        }
      }
      this.groupChecklistCounts.set(countsMap);

      // Load ungrouped checklists
      const ungrouped = await this.databaseService.getUngroupedChecklists();
      this.ungroupedChecklists.set(ungrouped);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  toggleGroupSelection(groupId: number): void {
    const selected = new Set(this.selectedGroupIds());
    if (selected.has(groupId)) {
      selected.delete(groupId);
    } else {
      selected.add(groupId);
    }
    this.selectedGroupIds.set(selected);
  }

  toggleChecklistSelection(checklistId: number): void {
    const selected = new Set(this.selectedChecklistIds());
    if (selected.has(checklistId)) {
      selected.delete(checklistId);
    } else {
      selected.add(checklistId);
    }
    this.selectedChecklistIds.set(selected);
  }

  isGroupSelected(groupId?: number): boolean {
    if (!groupId) return false;
    return this.selectedGroupIds().has(groupId);
  }

  isChecklistSelected(checklistId?: number): boolean {
    if (!checklistId) return false;
    return this.selectedChecklistIds().has(checklistId);
  }

  selectAll(): void {
    const allGroupIds = new Set(
      this.checklistGroups()
        .map((g) => g.id)
        .filter((id): id is number => id !== undefined)
    );
    const allChecklistIds = new Set(
      this.ungroupedChecklists()
        .map((c) => c.id)
        .filter((id): id is number => id !== undefined)
    );
    this.selectedGroupIds.set(allGroupIds);
    this.selectedChecklistIds.set(allChecklistIds);
  }

  deselectAll(): void {
    this.selectedGroupIds.set(new Set());
    this.selectedChecklistIds.set(new Set());
  }

  getSelectedCount(): number {
    return this.selectedGroupIds().size + this.selectedChecklistIds().size;
  }

  hasSelection(): boolean {
    return this.selectedGroupIds().size > 0 || this.selectedChecklistIds().size > 0;
  }

  getGroupChecklistCount(groupId?: number): number {
    if (!groupId) return 0;
    return this.groupChecklistCounts().get(groupId) || 0;
  }

  getColorClasses(color?: string): { bgClass: string; borderClass: string; textClass: string } {
    return getColorClasses(color, false);
  }

  async exportData(): Promise<void> {
    if (!this.hasSelection()) {
      return;
    }

    this.isExporting.set(true);
    this.exportSuccess.set(false);

    try {
      const csvRows: string[] = [];
      const selectedGroupIds = this.selectedGroupIds();
      const selectedChecklistIds = this.selectedChecklistIds();

      // CSV Header - includes group information
      csvRows.push(
        'Group ID,Group Title,Group Description,Group Icon,Group Color,Group Sort Order,Checklist ID,Checklist Title,Checklist Description,Checklist Icon,Checklist Color,Checklist Sort Order,Item ID,Item Title,Item Description,Item Is Done,Item Icon,Item Sort Order,Item Sub Items'
      );

      // Process selected groups and their checklists
      for (const group of this.checklistGroups()) {
        if (group.id && selectedGroupIds.has(group.id)) {
          const checklistsInGroup = await this.databaseService.getChecklistsByGroupId(group.id);

          if (checklistsInGroup.length === 0) {
            // Group with no checklists - still export the group
            const row = [
              group.id?.toString() || '',
              this.escapeCSVField(group.title),
              this.escapeCSVField(group.description || ''),
              group.icon || '',
              group.color || '',
              group.sortOrder?.toString() || '0',
              '',
              '',
              '',
              '',
              '',
              '',
              '',
              '',
              '',
              '',
              '',
              '',
              '',
            ];
            csvRows.push(row.join(','));
          } else {
            // Group with checklists - process each checklist
            for (const checklist of checklistsInGroup) {
              const items = checklist.id
                ? await this.databaseService.getChecklistItems(checklist.id)
                : [];

              if (items.length === 0) {
                // Checklist with no items - still export the checklist
                const row = [
                  group.id?.toString() || '',
                  this.escapeCSVField(group.title),
                  this.escapeCSVField(group.description || ''),
                  group.icon || '',
                  group.color || '',
                  group.sortOrder?.toString() || '0',
                  checklist.id?.toString() || '',
                  this.escapeCSVField(checklist.title),
                  this.escapeCSVField(checklist.description || ''),
                  checklist.icon || '',
                  checklist.color || '',
                  checklist.sortOrder?.toString() || '0',
                  '',
                  '',
                  '',
                  '',
                  '',
                  '',
                  '',
                ];
                csvRows.push(row.join(','));
              } else {
                // Checklist with items - one row per item
                for (const item of items) {
                  const row = [
                    group.id?.toString() || '',
                    this.escapeCSVField(group.title),
                    this.escapeCSVField(group.description || ''),
                    group.icon || '',
                    group.color || '',
                    group.sortOrder?.toString() || '0',
                    checklist.id?.toString() || '',
                    this.escapeCSVField(checklist.title),
                    this.escapeCSVField(checklist.description || ''),
                    checklist.icon || '',
                    checklist.color || '',
                    checklist.sortOrder?.toString() || '0',
                    item.id?.toString() || '',
                    this.escapeCSVField(item.title),
                    this.escapeCSVField(item.description || ''),
                    item.isDone ? 'true' : 'false',
                    item.icon || '',
                    item.sortOrder?.toString() || '0',
                    this.escapeCSVField(item.subItems ? JSON.stringify(item.subItems) : ''),
                  ];
                  csvRows.push(row.join(','));
                }
              }
            }
          }
        }
      }

      // Process selected ungrouped checklists
      for (const checklist of this.ungroupedChecklists()) {
        if (checklist.id && selectedChecklistIds.has(checklist.id)) {
          const items = await this.databaseService.getChecklistItems(checklist.id);

          if (items.length === 0) {
            // Checklist with no items - still export the checklist
            const row = [
              '', // No group
              '',
              '',
              '',
              '',
              '',
              checklist.id?.toString() || '',
              this.escapeCSVField(checklist.title),
              this.escapeCSVField(checklist.description || ''),
              checklist.icon || '',
              checklist.color || '',
              checklist.sortOrder?.toString() || '0',
              '',
              '',
              '',
              '',
              '',
              '',
              '',
            ];
            csvRows.push(row.join(','));
          } else {
            // Checklist with items - one row per item
            for (const item of items) {
              const row = [
                '', // No group
                '',
                '',
                '',
                '',
                '',
                checklist.id?.toString() || '',
                this.escapeCSVField(checklist.title),
                this.escapeCSVField(checklist.description || ''),
                checklist.icon || '',
                checklist.color || '',
                checklist.sortOrder?.toString() || '0',
                item.id?.toString() || '',
                this.escapeCSVField(item.title),
                this.escapeCSVField(item.description || ''),
                item.isDone ? 'true' : 'false',
                item.icon || '',
                item.sortOrder?.toString() || '0',
                this.escapeCSVField(item.subItems ? JSON.stringify(item.subItems) : ''),
              ];
              csvRows.push(row.join(','));
            }
          }
        }
      }

      // Create CSV content
      const csvContent = csvRows.join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);

      link.setAttribute('href', url);
      link.setAttribute('download', `chckd-export-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      this.exportSuccess.set(true);
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Failed to export data. Please try again.');
    } finally {
      this.isExporting.set(false);
    }
  }

  private escapeCSVField(field: string): string {
    if (!field) return '';
    // If field contains comma, quote, or newline, wrap in quotes and escape quotes
    if (field.includes(',') || field.includes('"') || field.includes('\n')) {
      return `"${field.replace(/"/g, '""')}"`;
    }
    return field;
  }

  goBack(): void {
    this.router.navigate(['/']);
  }
}
