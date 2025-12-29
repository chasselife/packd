import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ChecklistItem } from '../../models/checklist.model';
import { DatabaseService } from '../../services/database.service';
import { CHECKLIST_ITEM_ICON_OPTIONS } from '../../constants/icon-options.constant';

@Component({
  selector: 'app-new-checklist-item-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './new-checklist-item-dialog.component.html',
})
export class NewChecklistItemDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private databaseService = inject(DatabaseService);
  private location = inject(Location);

  form: FormGroup;
  isEditMode = false;
  checklistId: number | null = null;
  itemId: number | null = null;

  newTagInput = '';

  constructor() {
    // Initialize form with default values to prevent template errors
    this.form = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(1)]],
      description: [''],
      icon: [''],
      subItems: [[]],
    });
  }

  icons = CHECKLIST_ITEM_ICON_OPTIONS;

  async ngOnInit(): Promise<void> {
    const checklistIdParam = this.route.snapshot.paramMap.get('checklistId');
    const itemIdParam = this.route.snapshot.paramMap.get('itemId');

    if (!checklistIdParam) {
      // No checklist ID, redirect back
      this.router.navigate(['/']);
      return;
    }

    this.checklistId = Number(checklistIdParam);

    if (itemIdParam) {
      // Edit mode
      this.itemId = Number(itemIdParam);
      this.isEditMode = true;
      try {
        const items = await this.databaseService.getChecklistItems(this.checklistId);
        const item = items.find((i) => i.id === this.itemId);
        if (item) {
          // Update existing form with item data
          this.form.patchValue({
            title: item.title || '',
            description: item.description || '',
            icon: item.icon || '',
            subItems: item.subItems || [],
          });
        } else {
          // Item not found, redirect back
          this.router.navigate(['/checklist', this.checklistId]);
        }
      } catch (error) {
        console.error('Error loading item:', error);
        this.router.navigate(['/checklist', this.checklistId]);
      }
    }
    // For new item mode, form is already initialized with default values in constructor
  }

  goBack(): void {
    if (window.history.length > 1) {
      this.location.back();
    } else {
      if (this.checklistId) {
        this.router.navigate(['/checklist', this.checklistId]);
      } else {
        this.router.navigate(['/']);
      }
    }
  }

  async onSave(): Promise<void> {
    if (this.form.valid && this.checklistId) {
      try {
        const formValue = this.form.value;

        if (this.isEditMode && this.itemId) {
          // Update existing item
          await this.databaseService.updateChecklistItem(this.itemId, {
            title: formValue.title,
            description: formValue.description || '',
            icon: formValue.icon || '',
            subItems: formValue.subItems || [],
          });
        } else {
          // Create new item
          const currentItems = await this.databaseService.getChecklistItems(this.checklistId);
          const maxSortOrder =
            currentItems.length > 0 ? Math.max(...currentItems.map((item) => item.sortOrder)) : -1;

          await this.databaseService.createChecklistItem({
            checklistId: this.checklistId,
            title: formValue.title,
            description: formValue.description || '',
            icon: formValue.icon || '',
            subItems: formValue.subItems || [],
            isDone: false,
            sortOrder: maxSortOrder + 1,
          });
        }

        this.goBack();
      } catch (error) {
        console.error('Error saving item:', error);
      }
    }
  }

  getSelectedIcon(): { value: string; label: string } | undefined {
    const selectedValue = this.form.get('icon')?.value;
    if (!selectedValue) return undefined;
    return this.icons.find((icon) => icon.value === selectedValue);
  }

  getSubItems(): string[] {
    return this.form.get('subItems')?.value || [];
  }

  addTag(): void {
    const tag = this.newTagInput.trim();
    if (tag && !this.getSubItems().includes(tag)) {
      const currentSubItems = this.getSubItems();
      this.form.patchValue({
        subItems: [...currentSubItems, tag],
      });
      this.newTagInput = '';
    }
  }

  removeTag(tagToRemove: string): void {
    const currentSubItems = this.getSubItems();
    this.form.patchValue({
      subItems: currentSubItems.filter((tag) => tag !== tagToRemove),
    });
  }

  onTagInputKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.addTag();
    }
  }
}
