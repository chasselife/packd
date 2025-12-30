import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Checklist } from '../../models/checklist.model';
import { ChecklistGroup } from '../../models/checklist-group.model';
import { DatabaseService } from '../../services/database.service';
import { ColorPickerComponent } from '../color-picker/color-picker.component';
import { COLOR_OPTIONS } from '../../constants/color-options.constant';
import { CHECKLIST_ICON_OPTIONS } from '../../constants/icon-options.constant';

@Component({
  selector: 'app-new-checklist-dialog',
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
    ColorPickerComponent,
  ],
  templateUrl: './new-checklist-dialog.component.html',
})
export class NewChecklistDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private databaseService = inject(DatabaseService);
  private location = inject(Location);

  form: FormGroup;
  isEditMode = false;
  isDuplicateMode = false;
  checklistId: number | null = null;
  checklistGroups: ChecklistGroup[] = [];

  constructor() {
    // Initialize form with default values to prevent template errors
    // Using default color '#1d93c8' (Emerald) - first color in colorOptions
    this.form = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(1)]],
      icon: ['checklist', Validators.required],
      color: ['#1d93c8', Validators.required],
      groupId: [null], // Optional group selection
    });
  }

  icons = CHECKLIST_ICON_OPTIONS;

  colorOptions = COLOR_OPTIONS;

  async ngOnInit(): Promise<void> {
    // Load all checklist groups for the dropdown
    try {
      this.checklistGroups = await this.databaseService.getAllChecklistGroups();
      // Sort groups by sortOrder
      this.checklistGroups.sort((a, b) => a.sortOrder - b.sortOrder);
    } catch (error) {
      console.error('Error loading checklist groups:', error);
    }

    const checklistId = this.route.snapshot.paramMap.get('id');
    const isDuplicate = this.route.snapshot.queryParamMap.get('duplicate') === 'true';
    const groupIdParam = this.route.snapshot.queryParamMap.get('groupId');

    this.isDuplicateMode = isDuplicate;

    if (checklistId) {
      this.checklistId = Number(checklistId);
      try {
        const checklist = await this.databaseService.getChecklist(this.checklistId);
        if (checklist) {
          this.isEditMode = !isDuplicate;

          // Automatically append "Copy" to the title in duplicate mode
          const title =
            isDuplicate && checklist.title ? `${checklist.title} Copy` : checklist.title || '';

          // Update existing form with checklist data
          this.form.patchValue({
            title: title,
            icon: checklist.icon || 'checklist',
            color: checklist.color || COLOR_OPTIONS[0].value,
            groupId: checklist.groupId || null,
          });
        } else {
          // Checklist not found, redirect back
          this.router.navigate(['/']);
        }
      } catch (error) {
        console.error('Error loading checklist:', error);
        this.router.navigate(['/']);
      }
    } else {
      // For new checklist mode, set groupId from query param if provided
      if (groupIdParam) {
        const groupId = Number(groupIdParam);
        this.form.patchValue({
          groupId: groupId,
        });
      }
    }
  }

  goBack(): void {
    if (window.history.length > 1) {
      this.location.back();
    } else {
      this.router.navigate(['/']);
    }
  }

  async onCreate(): Promise<void> {
    if (this.form.valid) {
      try {
        const formValue = this.form.value;
        const groupId = formValue.groupId ? Number(formValue.groupId) : undefined;

        await this.databaseService.createChecklist({
          title: formValue.title,
          icon: formValue.icon,
          color: formValue.color,
          groupId: groupId,
        });

        if (window.history.length > 1) {
          this.location.back();
        } else {
          // Navigate back to the group page if groupId was provided, otherwise go to home
          if (groupId) {
            this.router.navigate(['/checklist-group', groupId]);
          } else {
            this.router.navigate(['/']);
          }
        }
      } catch (error) {
        console.error('Error creating checklist:', error);
      }
    }
  }

  async onSave(): Promise<void> {
    if (this.form.valid && this.checklistId) {
      try {
        const formValue = this.form.value;
        const groupId = formValue.groupId ? Number(formValue.groupId) : undefined;
        await this.databaseService.updateChecklist(this.checklistId, {
          title: formValue.title,
          icon: formValue.icon,
          color: formValue.color,
          groupId: groupId,
        });
        this.goBack();
      } catch (error) {
        console.error('Error updating checklist:', error);
      }
    }
  }

  getSelectedIcon(): { value: string; label: string } | undefined {
    const selectedValue = this.form.get('icon')?.value;
    return this.icons.find((icon) => icon.value === selectedValue);
  }

  getSelectedColor():
    | { value: string; label: string; bgClass: string; borderClass: string; textClass: string }
    | undefined {
    const selectedValue = this.form.get('color')?.value;
    return COLOR_OPTIONS.find((color) => color.value === selectedValue);
  }

  getSelectedGroup(): ChecklistGroup | undefined {
    const selectedGroupId = this.form.get('groupId')?.value;
    if (!selectedGroupId) {
      return undefined;
    }
    return this.checklistGroups.find((group) => group.id === selectedGroupId);
  }

  async onDuplicate(): Promise<void> {
    if (this.form.valid && this.checklistId) {
      try {
        const formValue = this.form.value;
        const groupId = formValue.groupId ? Number(formValue.groupId) : undefined;
        // Create the duplicated checklist
        const newChecklistId = await this.databaseService.createChecklist({
          title: formValue.title,
          icon: formValue.icon,
          color: formValue.color,
          groupId: groupId,
        });

        // Get items from the original checklist and duplicate them
        const items = await this.databaseService.getChecklistItems(this.checklistId);
        if (items.length > 0) {
          for (const item of items) {
            await this.databaseService.createChecklistItem({
              checklistId: newChecklistId,
              title: item.title,
              description: item.description || '',
              icon: item.icon || '',
              isDone: false, // Reset isDone for duplicated items
              sortOrder: item.sortOrder,
            });
          }
        }

        // Navigate back to the group page if groupId was provided, otherwise go back
        if (groupId) {
          this.router.navigate(['/checklist-group', groupId]);
        } else {
          this.goBack();
        }
      } catch (error) {
        console.error('Error duplicating checklist:', error);
      }
    }
  }
}
