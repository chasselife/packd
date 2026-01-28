import { CommonModule } from '@angular/common';
import { Component, ElementRef, inject, signal, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Router } from '@angular/router';
import { BackButton } from '../../../core/components/back-button/back-button';
import { FormHeader } from '../../../core/components/layout/form-header/form-header';
import { getColorData } from '../../../core/constants/color-options.constant';
import {
  ChecklistTileComponent,
  TileItem,
} from '../../components/checklist-tile/checklist-tile.component';
import { ChecklistGroup } from '../../models/checklist-group.model';
import { Checklist, ChecklistItem } from '../../models/checklist.model';
import { DatabaseService } from '../../services/database.service';

interface ParsedChecklist {
  checklist: Omit<Checklist, 'id' | 'createdAt' | 'updatedAt'>;
  items: Omit<ChecklistItem, 'id' | 'createdAt' | 'updatedAt' | 'checklistId'>[];
  group?: Omit<ChecklistGroup, 'id' | 'createdAt' | 'updatedAt'>;
}

interface ParsedGroup {
  group: Omit<ChecklistGroup, 'id' | 'createdAt' | 'updatedAt'>;
  checklists: ParsedChecklist[];
}

@Component({
  selector: 'app-import-checklist',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatProgressBarModule,
    MatCheckboxModule,
    ChecklistTileComponent,
    FormHeader,
    BackButton,
  ],
  templateUrl: './import-checklist.component.html',
})
export class ImportChecklistComponent {
  private databaseService = inject(DatabaseService);
  private router = inject(Router);

  @ViewChild('successMessage', { static: false }) successMessageRef?: ElementRef;

  fileSelected = signal(false);
  parsedData = signal<ParsedChecklist[]>([]);
  parsedGroups = signal<ParsedGroup[]>([]);
  selectedIndices = signal<Set<number>>(new Set());
  selectedGroupIndices = signal<Set<number>>(new Set());
  errorMessage = signal<string>('');
  isImporting = signal(false);
  importSuccess = signal<number | null>(null);
  overwriteExisting = signal(false);

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      return;
    }

    if (!file.name.endsWith('.csv')) {
      this.errorMessage.set('Please select a CSV file.');
      return;
    }

    this.fileSelected.set(true);
    this.errorMessage.set('');
    this.importSuccess.set(null);
    this.selectedIndices.set(new Set());
    this.selectedGroupIndices.set(new Set());

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csv = e.target?.result as string;
        const { checklists, groups } = this.parseCSV(csv);
        this.parsedData.set(checklists);
        this.parsedGroups.set(groups);
        // Select all by default
        const allIndices = new Set(checklists.map((_, index) => index));
        this.selectedIndices.set(allIndices);
        const allGroupIndices = new Set(groups.map((_, index) => index));
        this.selectedGroupIndices.set(allGroupIndices);
      } catch (error) {
        console.error('Error parsing CSV:', error);
        this.errorMessage.set('Failed to parse CSV file. Please check the format.');
        this.fileSelected.set(false);
      }
    };
    reader.readAsText(file);
  }

  private parseCSV(csv: string): {
    checklists: ParsedChecklist[];
    groups: ParsedGroup[];
  } {
    // Parse CSV into rows, handling newlines within quoted fields
    const rows = this.parseCSVRows(csv);

    if (rows.length < 2) {
      throw new Error('CSV file is empty or invalid');
    }

    // Parse header
    const header = this.parseCSVLine(rows[0]);
    const hasGroups = header.includes('Group Title');

    // Parse data rows
    const checklistMap = new Map<
      string,
      {
        checklist: Omit<Checklist, 'id' | 'createdAt' | 'updatedAt'>;
        items: Omit<ChecklistItem, 'id' | 'createdAt' | 'updatedAt' | 'checklistId'>[];
        group?: Omit<ChecklistGroup, 'id' | 'createdAt' | 'updatedAt'>;
      }
    >();

    const groupMap = new Map<string, ParsedGroup>();

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (!row.trim()) continue;

      // Parse CSV line (handle quoted fields)
      const values = this.parseCSVLine(row);
      if (values.length < header.length) {
        continue; // Skip invalid rows
      }

      let groupId = '';
      let groupTitle = '';
      let groupDescription = '';
      let groupIcon = '';
      let groupColor = '';
      let groupSortOrder = 0;
      let checklistId = '';
      let checklistTitle = '';
      let checklistDescription = '';
      let checklistIcon = '';
      let checklistColor = '';
      let checklistSortOrder = 0;
      let itemTitle = '';
      let itemDescription = '';
      let itemIsDone = false;
      let itemIcon = '';
      let itemSortOrder = 0;
      let itemSubItems = '';

      if (hasGroups) {
        // New format with groups
        const groupIdIndex = header.indexOf('Group ID');
        const groupTitleIndex = header.indexOf('Group Title');
        const groupDescriptionIndex = header.indexOf('Group Description');
        const groupIconIndex = header.indexOf('Group Icon');
        const groupColorIndex = header.indexOf('Group Color');
        const groupSortOrderIndex = header.indexOf('Group Sort Order');
        const checklistIdIndex = header.indexOf('Checklist ID');
        const checklistTitleIndex = header.indexOf('Checklist Title');
        const checklistDescriptionIndex = header.indexOf('Checklist Description');
        const checklistIconIndex = header.indexOf('Checklist Icon');
        const checklistColorIndex = header.indexOf('Checklist Color');
        const checklistSortOrderIndex = header.indexOf('Checklist Sort Order');
        const itemIdIndex = header.indexOf('Item ID');
        const itemTitleIndex = header.indexOf('Item Title');
        const itemDescriptionIndex = header.indexOf('Item Description');
        const itemIsDoneIndex = header.indexOf('Item Is Done');
        const itemIconIndex = header.indexOf('Item Icon');
        const itemSortOrderIndex = header.indexOf('Item Sort Order');
        const itemSubItemsIndex = header.indexOf('Item Sub Items');

        groupId = values[groupIdIndex] || '';
        groupTitle = this.unescapeCSVField(values[groupTitleIndex] || '');
        groupDescription = this.unescapeCSVField(values[groupDescriptionIndex] || '');
        groupIcon = values[groupIconIndex] || '';
        groupColor = values[groupColorIndex] || '';
        groupSortOrder = parseInt(values[groupSortOrderIndex] || '0', 10) || 0;
        checklistId = values[checklistIdIndex] || '';
        checklistTitle = this.unescapeCSVField(values[checklistTitleIndex] || '');
        checklistDescription = this.unescapeCSVField(values[checklistDescriptionIndex] || '');
        checklistIcon = values[checklistIconIndex] || '';
        checklistColor = values[checklistColorIndex] || '';
        checklistSortOrder = parseInt(values[checklistSortOrderIndex] || '0', 10) || 0;
        itemTitle = this.unescapeCSVField(values[itemTitleIndex] || '');
        itemDescription = this.unescapeCSVField(values[itemDescriptionIndex] || '');
        itemIsDone = values[itemIsDoneIndex] === 'true';
        itemIcon = values[itemIconIndex] || '';
        itemSortOrder = parseInt(values[itemSortOrderIndex] || '0', 10) || 0;
        // itemSubItems is a JSON string, parseCSVLine already unescaped it, so use it directly
        itemSubItems = values[itemSubItemsIndex] || '';
      } else {
        // Old format without groups (backward compatibility)
        const checklistIdIndex = header.indexOf('Checklist ID');
        const checklistTitleIndex = header.indexOf('Checklist Title');
        const checklistDescriptionIndex = header.indexOf('Checklist Description');
        const checklistIconIndex = header.indexOf('Checklist Icon');
        const checklistColorIndex = header.indexOf('Checklist Color');
        const checklistSortOrderIndex = header.indexOf('Checklist Sort Order');
        const itemIdIndex = header.indexOf('Item ID');
        const itemTitleIndex = header.indexOf('Item Title');
        const itemDescriptionIndex = header.indexOf('Item Description');
        const itemIsDoneIndex = header.indexOf('Item Is Done');
        const itemIconIndex = header.indexOf('Item Icon');
        const itemSortOrderIndex = header.indexOf('Item Sort Order');
        const itemSubItemsIndex = header.indexOf('Item Sub Items');

        checklistId = values[checklistIdIndex] || '';
        checklistTitle = this.unescapeCSVField(values[checklistTitleIndex] || '');
        checklistDescription = this.unescapeCSVField(values[checklistDescriptionIndex] || '');
        checklistIcon = values[checklistIconIndex] || '';
        checklistColor = values[checklistColorIndex] || '';
        checklistSortOrder = parseInt(values[checklistSortOrderIndex] || '0', 10) || 0;
        itemTitle = this.unescapeCSVField(values[itemTitleIndex] || '');
        itemDescription = this.unescapeCSVField(values[itemDescriptionIndex] || '');
        itemIsDone = values[itemIsDoneIndex] === 'true';
        itemIcon = values[itemIconIndex] || '';
        itemSortOrder = parseInt(values[itemSortOrderIndex] || '0', 10) || 0;
        // itemSubItems is a JSON string, parseCSVLine already unescaped it, so use it directly
        itemSubItems = values[itemSubItemsIndex] || '';
      }

      // Process groups
      if (hasGroups && groupTitle) {
        if (!groupMap.has(groupTitle)) {
          groupMap.set(groupTitle, {
            group: {
              title: groupTitle,
              description: groupDescription || undefined,
              icon: groupIcon || undefined,
              color: groupColor || undefined,
              sortOrder: groupSortOrder,
            },
            checklists: [],
          });
        }
      }

      // Process checklists
      if (checklistTitle) {
        const key = groupTitle ? `${groupTitle}::${checklistTitle}` : checklistTitle;

        if (!checklistMap.has(key)) {
          checklistMap.set(key, {
            checklist: {
              title: checklistTitle,
              description: checklistDescription || undefined,
              icon: checklistIcon || undefined,
              color: checklistColor || undefined,
              sortOrder: checklistSortOrder,
            },
            items: [],
            group: groupTitle
              ? {
                  title: groupTitle,
                  description: groupDescription || undefined,
                  icon: groupIcon || undefined,
                  color: groupColor || undefined,
                  sortOrder: groupSortOrder,
                }
              : undefined,
          });
        }

        const entry = checklistMap.get(key)!;

        // Add item if it has a title
        if (itemTitle) {
          let subItemsArray: string[] | undefined = undefined;
          if (itemSubItems && itemSubItems.trim()) {
            const trimmed = itemSubItems.trim();
            try {
              // Check if it looks like a JSON array (starts with [)
              if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
                // Try to parse as JSON
                const parsed = JSON.parse(trimmed);
                // Ensure it's an array
                if (Array.isArray(parsed)) {
                  subItemsArray = parsed.filter((item) => typeof item === 'string' && item.trim());
                }
              } else {
                // Not valid JSON array format, try treating as comma-separated values
                const parts = trimmed
                  .split(',')
                  .map((p) => p.trim())
                  .filter((p) => p);
                if (parts.length > 0) {
                  subItemsArray = parts;
                }
              }
            } catch (e) {
              // JSON.parse failed - might be unquoted array like [item1,item2]
              // or comma-separated values
              if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
                // Looks like array but JSON.parse failed - probably unquoted values
                // Extract content between brackets and split by comma
                const content = trimmed.slice(1, -1).trim();
                if (content) {
                  const parts = content
                    .split(',')
                    .map((p) => p.trim())
                    .filter((p) => p);
                  if (parts.length > 0) {
                    subItemsArray = parts;
                  }
                }
              } else {
                // Not an array format, treat as comma-separated values
                const parts = trimmed
                  .split(',')
                  .map((p) => p.trim())
                  .filter((p) => p);
                if (parts.length > 0) {
                  subItemsArray = parts;
                } else if (trimmed) {
                  // Single value
                  subItemsArray = [trimmed];
                }
              }
            }
          }
          entry.items.push({
            title: itemTitle,
            description: itemDescription || undefined,
            isDone: itemIsDone,
            icon: itemIcon || undefined,
            subItems: subItemsArray,
            sortOrder: itemSortOrder,
          });
        }
      }
    }

    // Organize checklists into groups
    const groups: ParsedGroup[] = [];
    const ungroupedChecklists: ParsedChecklist[] = [];

    for (const entry of checklistMap.values()) {
      if (entry.group) {
        const groupKey = entry.group.title;
        if (!groupMap.has(groupKey)) {
          groupMap.set(groupKey, {
            group: entry.group,
            checklists: [],
          });
        }
        groupMap.get(groupKey)!.checklists.push({
          checklist: entry.checklist,
          items: entry.items,
          group: entry.group,
        });
      } else {
        ungroupedChecklists.push({
          checklist: entry.checklist,
          items: entry.items,
        });
      }
    }

    return {
      checklists: ungroupedChecklists,
      groups: Array.from(groupMap.values()),
    };
  }

  /**
   * Parses CSV string into rows, properly handling newlines within quoted fields.
   * This method respects CSV quoting rules where newlines inside quoted fields
   * are part of the field value, not row separators.
   */
  private parseCSVRows(csv: string): string[] {
    const rows: string[] = [];
    let currentRow = '';
    let inQuotes = false;

    for (let i = 0; i < csv.length; i++) {
      const char = csv[i];
      const nextChar = csv[i + 1];

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          // Escaped quote (double quote)
          currentRow += '"';
          i++; // Skip next quote
        } else {
          // Toggle quote state
          inQuotes = !inQuotes;
          currentRow += char;
        }
      } else if (char === '\r' && !inQuotes && nextChar === '\n') {
        // Handle \r\n line endings - skip \r, \n will be handled next
        continue;
      } else if (char === '\n' && !inQuotes) {
        // End of row (only if not inside quotes)
        if (currentRow.trim() || rows.length === 0) {
          // Include row if it has content or if it's the header row
          rows.push(currentRow);
        }
        currentRow = '';
      } else {
        currentRow += char;
      }
    }

    // Add the last row if it exists
    if (currentRow.trim() || rows.length === 0) {
      rows.push(currentRow);
    }

    return rows;
  }

  private parseCSVLine(line: string): string[] {
    const values: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          // Escaped quote
          current += '"';
          i++;
        } else {
          // Toggle quote state
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        // End of field
        values.push(current);
        current = '';
      } else {
        current += char;
      }
    }

    // Add last field
    values.push(current);
    return values;
  }

  private unescapeCSVField(field: string): string {
    if (!field) return '';
    // Remove surrounding quotes if present
    if (field.startsWith('"') && field.endsWith('"')) {
      field = field.slice(1, -1);
    }
    // Unescape double quotes
    return field.replace(/""/g, '"');
  }

  onChecklistSelectionChanged(event: { item: TileItem; selected: boolean }, index: number): void {
    if (event.selected) {
      const selected = new Set(this.selectedIndices());
      selected.add(index);
      this.selectedIndices.set(selected);
    } else {
      const selected = new Set(this.selectedIndices());
      selected.delete(index);
      this.selectedIndices.set(selected);
    }
  }

  onGroupSelectionChanged(event: { item: TileItem; selected: boolean }, index: number): void {
    if (event.selected) {
      const selected = new Set(this.selectedGroupIndices());
      selected.add(index);
      this.selectedGroupIndices.set(selected);
    } else {
      const selected = new Set(this.selectedGroupIndices());
      selected.delete(index);
      this.selectedGroupIndices.set(selected);
    }
  }

  isSelected(index: number): boolean {
    return this.selectedIndices().has(index);
  }

  isGroupSelected(index: number): boolean {
    return this.selectedGroupIndices().has(index);
  }

  getSelectedCount(): number {
    return this.selectedIndices().size + this.selectedGroupIndices().size;
  }

  hasSelection(): boolean {
    return this.selectedIndices().size > 0 || this.selectedGroupIndices().size > 0;
  }

  async importData(): Promise<void> {
    this.isImporting.set(true);
    this.errorMessage.set('');

    try {
      // If overwrite is enabled, delete all existing data first
      if (this.overwriteExisting()) {
        const existingChecklists = await this.databaseService.getAllChecklists();
        for (const checklist of existingChecklists) {
          if (checklist.id) {
            await this.databaseService.deleteChecklist(checklist.id);
          }
        }
        const existingGroups = await this.databaseService.getAllChecklistGroups();
        for (const group of existingGroups) {
          if (group.id) {
            await this.databaseService.deleteChecklistGroup(group.id);
          }
        }
      }

      const parsed = this.parsedData();
      const parsedGroups = this.parsedGroups();
      const selected = this.selectedIndices();
      const selectedGroups = this.selectedGroupIndices();
      let importedCount = 0;

      // Import groups
      for (let i = 0; i < parsedGroups.length; i++) {
        if (selectedGroups.has(i)) {
          const groupData = parsedGroups[i];
          // Create group
          const groupId = await this.databaseService.createChecklistGroup(groupData.group);

          // Create checklists in the group
          for (const checklistData of groupData.checklists) {
            const checklistId = await this.databaseService.createChecklist({
              ...checklistData.checklist,
              groupId,
            });

            // Create items
            for (const item of checklistData.items) {
              await this.databaseService.createChecklistItem({
                ...item,
                checklistId,
              });
            }
          }

          importedCount += groupData.checklists.length;
        }
      }

      // Import ungrouped checklists
      for (let i = 0; i < parsed.length; i++) {
        if (selected.has(i)) {
          const data = parsed[i];
          // Create checklist
          const checklistId = await this.databaseService.createChecklist(data.checklist);

          // Create items
          for (const item of data.items) {
            await this.databaseService.createChecklistItem({
              ...item,
              checklistId,
            });
          }

          importedCount++;
        }
      }

      this.importSuccess.set(importedCount);
      // Reset selections after successful import
      this.selectedIndices.set(new Set());
      this.selectedGroupIndices.set(new Set());
      this.successMessageRef?.nativeElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    } catch (error) {
      console.error('Error importing data:', error);
      this.errorMessage.set('Failed to import data. Please try again.');
    } finally {
      this.isImporting.set(false);
    }
  }

  getColorClasses(color?: string): { bgClass: string; borderClass: string; textClass: string } {
    return getColorData(color, false);
  }

  getGroupAsTileItem(groupData: ParsedGroup, index: number): TileItem {
    // Convert parsed group to TileItem format (add missing fields with defaults)
    return {
      ...groupData.group,
      id: index, // Use index as temporary ID
      createdAt: new Date(),
      updatedAt: new Date(),
    } as ChecklistGroup;
  }

  getChecklistAsTileItem(data: ParsedChecklist, index: number): TileItem {
    // Convert parsed checklist to TileItem format (add missing fields with defaults)
    return {
      ...data.checklist,
      id: index, // Use index as temporary ID
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Checklist;
  }

  reset(): void {
    this.fileSelected.set(false);
    this.parsedData.set([]);
    this.parsedGroups.set([]);
    this.selectedIndices.set(new Set());
    this.selectedGroupIndices.set(new Set());
    this.errorMessage.set('');
    this.importSuccess.set(null);
    this.overwriteExisting.set(false);
  }

  goBack(): void {
    this.router.navigate(['/chckd']);
  }
}
