import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ChecklistGroup } from '../../models/checklist-group.model';
import { DatabaseService } from '../../services/database.service';
import { ChecklistTileComponent } from '../checklist-tile/checklist-tile.component';
import { ColorPickerComponent } from '../color-picker/color-picker.component';
import { COLOR_OPTIONS } from '../../constants/color-options.constant';
import { CHECKLIST_ICON_OPTIONS } from '../../constants/icon-options.constant';
import { getColorClasses, ColorClasses } from '../../constants/color-options.constant';

@Component({
  selector: 'app-new-checklist-group-dialog',
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
    ChecklistTileComponent,
    ColorPickerComponent,
  ],
  templateUrl: './new-checklist-group-dialog.component.html',
})
export class NewChecklistGroupDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private databaseService = inject(DatabaseService);
  private location = inject(Location);

  form: FormGroup;
  isEditMode = false;
  groupId: number | null = null;

  constructor() {
    this.form = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(1)]],
      description: [''],
      icon: ['folder', Validators.required],
      color: ['#1d93c8', Validators.required],
    });
  }

  icons = CHECKLIST_ICON_OPTIONS;

  colorOptions = COLOR_OPTIONS;

  async ngOnInit(): Promise<void> {
    const groupIdParam = this.route.snapshot.paramMap.get('id');

    if (groupIdParam) {
      this.groupId = Number(groupIdParam);
      try {
        const group = await this.databaseService.getChecklistGroup(this.groupId);
        if (group) {
          this.isEditMode = true;
          this.form.patchValue({
            title: group.title,
            description: group.description || '',
            icon: group.icon || 'folder',
            color: group.color || COLOR_OPTIONS[0].value,
          });
        } else {
          this.router.navigate(['/']);
        }
      } catch (error) {
        console.error('Error loading checklist group:', error);
        this.router.navigate(['/']);
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
        await this.databaseService.createChecklistGroup({
          title: formValue.title,
          description: formValue.description || undefined,
          icon: formValue.icon,
          color: formValue.color,
        });
        this.goBack();
      } catch (error) {
        console.error('Error creating checklist group:', error);
      }
    }
  }

  async onSave(): Promise<void> {
    if (this.form.valid && this.groupId) {
      try {
        const formValue = this.form.value;
        await this.databaseService.updateChecklistGroup(this.groupId, {
          title: formValue.title,
          description: formValue.description || undefined,
          icon: formValue.icon,
          color: formValue.color,
        });
        this.goBack();
      } catch (error) {
        console.error('Error updating checklist group:', error);
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

  getPreviewGroup(): ChecklistGroup {
    const formValue = this.form.value;
    return {
      id: undefined,
      title: formValue.title || 'Your Group Title',
      description: formValue.description || undefined,
      icon: formValue.icon || 'folder',
      color: formValue.color || COLOR_OPTIONS[0].value,
      sortOrder: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  getSelectedColorClasses(): ColorClasses {
    const selectedColor = this.form?.get('color')?.value;
    return getColorClasses(selectedColor, false);
  }

  getSelectedColorValue(): string {
    return this.form?.get('color')?.value || '#1d93c8';
  }
}
