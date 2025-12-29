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
      icon: ['folder', Validators.required],
      color: ['#53b87d', Validators.required],
    });
  }

  icons = [
    { value: 'folder', label: 'Folder' },
    { value: 'folder_special', label: 'Special Folder' },
    { value: 'category', label: 'Category' },
    { value: 'label', label: 'Label' },
    { value: 'bookmark', label: 'Bookmark' },
    { value: 'collections', label: 'Collections' },
    { value: 'inventory_2', label: 'Inventory' },
    { value: 'archive', label: 'Archive' },
    { value: 'work', label: 'Work' },
    { value: 'home', label: 'Home' },
    { value: 'school', label: 'School' },
    { value: 'sports', label: 'Sports' },
    { value: 'fitness_center', label: 'Fitness' },
    { value: 'restaurant', label: 'Restaurant' },
    { value: 'shopping_cart', label: 'Shopping' },
    { value: 'flight', label: 'Travel' },
    { value: 'camping', label: 'Camping' },
    { value: 'beach_access', label: 'Beach' },
    { value: 'snowboarding', label: 'Winter Sports' },
    { value: 'directions_bike', label: 'Biking' },
  ];

  colorOptions = [
    {
      value: '#53b87d',
      label: 'Emerald',
      bgClass: 'bg-primary-500/20',
      borderClass: 'border-primary',
      textClass: 'text-primary',
    },
    {
      value: '#3b82f6',
      label: 'Blue',
      bgClass: 'bg-blue-500/20',
      borderClass: 'border-blue-700',
      textClass: 'text-blue-700',
    },
    {
      value: '#8b5cf6',
      label: 'Purple',
      bgClass: 'bg-purple-500/20',
      borderClass: 'border-purple-700',
      textClass: 'text-purple-700',
    },
    {
      value: '#ec4899',
      label: 'Pink',
      bgClass: 'bg-pink-500/20',
      borderClass: 'border-pink-700',
      textClass: 'text-pink-700',
    },
    {
      value: '#f59e0b',
      label: 'Amber',
      bgClass: 'bg-amber-500/20',
      borderClass: 'border-amber-700',
      textClass: 'text-amber-700',
    },
    {
      value: '#10b981',
      label: 'Green',
      bgClass: 'bg-green-500/20',
      borderClass: 'border-green-700',
      textClass: 'text-green-700',
    },
    {
      value: '#06b6d4',
      label: 'Cyan',
      bgClass: 'bg-cyan-500/20',
      borderClass: 'border-cyan-700',
      textClass: 'text-cyan-700',
    },
    {
      value: '#f97316',
      label: 'Orange',
      bgClass: 'bg-orange-500/20',
      borderClass: 'border-orange-700',
      textClass: 'text-orange-700',
    },
    {
      value: '#6366f1',
      label: 'Indigo',
      bgClass: 'bg-indigo-500/20',
      borderClass: 'border-indigo-700',
      textClass: 'text-indigo-700',
    },
    {
      value: '#14b8a6',
      label: 'Teal',
      bgClass: 'bg-teal-500/20',
      borderClass: 'border-teal-700',
      textClass: 'text-teal-700',
    },
  ];

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
            icon: group.icon || 'folder',
            color: group.color || this.colorOptions[0].value,
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
    return this.colorOptions.find((color) => color.value === selectedValue);
  }

  getPreviewGroup(): ChecklistGroup {
    const formValue = this.form.value;
    return {
      id: undefined,
      title: formValue.title || 'Your Group Title',
      icon: formValue.icon || 'folder',
      color: formValue.color || this.colorOptions[0].value,
      sortOrder: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }
}
