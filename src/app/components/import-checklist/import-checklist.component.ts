import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { DatabaseService } from '../../services/database.service';
import { Checklist, ChecklistItem } from '../../models/checklist.model';

interface ParsedChecklist {
  checklist: Omit<Checklist, 'id' | 'createdAt' | 'updatedAt'>;
  items: Omit<ChecklistItem, 'id' | 'createdAt' | 'updatedAt' | 'checklistId'>[];
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
  ],
  templateUrl: './import-checklist.component.html',
})
export class ImportChecklistComponent {
  private databaseService = inject(DatabaseService);
  private router = inject(Router);

  fileSelected = signal(false);
  parsedData = signal<ParsedChecklist[]>([]);
  selectedIndices = signal<Set<number>>(new Set());
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

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csv = e.target?.result as string;
        const parsed = this.parseCSV(csv);
        this.parsedData.set(parsed);
        // Select all by default
        const allIndices = new Set(parsed.map((_, index) => index));
        this.selectedIndices.set(allIndices);
      } catch (error) {
        console.error('Error parsing CSV:', error);
        this.errorMessage.set('Failed to parse CSV file. Please check the format.');
        this.fileSelected.set(false);
      }
    };
    reader.readAsText(file);
  }

  private parseCSV(csv: string): ParsedChecklist[] {
    const lines = csv.split('\n').filter((line) => line.trim());
    if (lines.length < 2) {
      throw new Error('CSV file is empty or invalid');
    }

    // Parse header
    const header = lines[0].split(',');
    const expectedHeader = [
      'Checklist ID',
      'Checklist Title',
      'Checklist Icon',
      'Checklist Color',
      'Checklist Sort Order',
      'Item ID',
      'Item Title',
      'Item Description',
      'Item Is Done',
      'Item Icon',
      'Item Sort Order',
    ];

    // Check if header matches (flexible - just check key fields)
    if (!header.includes('Checklist Title')) {
      throw new Error('Invalid CSV format. Expected "Checklist Title" column.');
    }

    // Parse data rows
    const checklistMap = new Map<
      string,
      {
        checklist: Omit<Checklist, 'id' | 'createdAt' | 'updatedAt'>;
        items: Omit<ChecklistItem, 'id' | 'createdAt' | 'updatedAt' | 'checklistId'>[];
      }
    >();

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line.trim()) continue;

      // Parse CSV line (handle quoted fields)
      const values = this.parseCSVLine(line);
      if (values.length < header.length) {
        continue; // Skip invalid rows
      }

      const checklistId = values[0] || '';
      const checklistTitle = this.unescapeCSVField(values[1] || '');
      const checklistIcon = values[2] || '';
      const checklistColor = values[3] || '';
      const checklistSortOrder = parseInt(values[4] || '0', 10) || 0;

      const itemTitle = this.unescapeCSVField(values[6] || '');
      const itemDescription = this.unescapeCSVField(values[7] || '');
      const itemIsDone = values[8] === 'true';
      const itemIcon = values[9] || '';
      const itemSortOrder = parseInt(values[10] || '0', 10) || 0;

      // Use checklist title as key (since IDs might not match)
      const key = checklistTitle;

      if (!checklistMap.has(key)) {
        checklistMap.set(key, {
          checklist: {
            title: checklistTitle,
            icon: checklistIcon || undefined,
            color: checklistColor || undefined,
            sortOrder: checklistSortOrder,
          },
          items: [],
        });
      }

      const entry = checklistMap.get(key)!;

      // Add item if it has a title
      if (itemTitle) {
        entry.items.push({
          title: itemTitle,
          description: itemDescription || undefined,
          isDone: itemIsDone,
          icon: itemIcon || undefined,
          sortOrder: itemSortOrder,
        });
      }
    }

    return Array.from(checklistMap.values());
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

  toggleSelection(index: number): void {
    const selected = new Set(this.selectedIndices());
    if (selected.has(index)) {
      selected.delete(index);
    } else {
      selected.add(index);
    }
    this.selectedIndices.set(selected);
  }

  isSelected(index: number): boolean {
    return this.selectedIndices().has(index);
  }

  getSelectedCount(): number {
    return this.selectedIndices().size;
  }

  hasSelection(): boolean {
    return this.selectedIndices().size > 0;
  }

  async importData(): Promise<void> {
    this.isImporting.set(true);
    this.errorMessage.set('');

    try {
      // If overwrite is enabled, delete all existing checklists first
      if (this.overwriteExisting()) {
        const existingChecklists = await this.databaseService.getAllChecklists();
        for (const checklist of existingChecklists) {
          if (checklist.id) {
            await this.databaseService.deleteChecklist(checklist.id);
          }
        }
      }

      const parsed = this.parsedData();
      const selected = this.selectedIndices();
      let importedCount = 0;

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
    } catch (error) {
      console.error('Error importing data:', error);
      this.errorMessage.set('Failed to import data. Please try again.');
    } finally {
      this.isImporting.set(false);
    }
  }

  getColorClasses(color?: string): { bgClass: string; borderClass: string; textClass: string } {
    const defaultColor = {
      bgClass: 'bg-primary-500/20',
      borderClass: 'border-primary',
      textClass: 'text-primary',
    };

    if (!color) return defaultColor;

    const colorMap: Record<string, { bgClass: string; borderClass: string; textClass: string }> = {
      '#53b87d': {
        bgClass: 'bg-primary-500/20',
        borderClass: 'border-primary',
        textClass: 'text-primary',
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

  reset(): void {
    this.fileSelected.set(false);
    this.parsedData.set([]);
    this.selectedIndices.set(new Set());
    this.errorMessage.set('');
    this.importSuccess.set(null);
    this.overwriteExisting.set(false);
  }

  goBack(): void {
    this.router.navigate(['/']);
  }
}
