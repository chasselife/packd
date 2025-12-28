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
import { DatabaseService } from '../../services/database.service';

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

  constructor() {
    // Initialize form with default values to prevent template errors
    // Using default color '#53b87d' (Emerald) - first color in colorOptions
    this.form = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(1)]],
      icon: ['checklist', Validators.required],
      color: ['#53b87d', Validators.required],
    });
  }

  // Popular Material Icons for checklists
  icons = [
    { value: 'checklist', label: 'Checklist' },
    { value: 'camping', label: 'Camping' },
    { value: 'backpack', label: 'Backpack' },
    { value: 'hiking', label: 'Hiking' },
    { value: 'sports', label: 'Sports' },
    { value: 'fitness_center', label: 'Fitness' },
    { value: 'restaurant', label: 'Restaurant' },
    { value: 'shopping_cart', label: 'Shopping' },
    { value: 'work', label: 'Work' },
    { value: 'school', label: 'School' },
    { value: 'home', label: 'Home' },
    { value: 'flight', label: 'Travel' },
    { value: 'beach_access', label: 'Beach' },
    { value: 'snowboarding', label: 'Winter Sports' },
    { value: 'directions_bike', label: 'Biking' },
    { value: 'pool', label: 'Pool' },
    { value: 'music_note', label: 'Music' },
    { value: 'book', label: 'Books' },
    { value: 'local_movies', label: 'Movies' },
    { value: 'videogame_asset', label: 'Games' },
    // Icons from seed-data.service.ts
    { value: 'outdoor_garden', label: 'Outdoor Garden' },
    { value: 'checkroom', label: 'Checkroom' },
    { value: 'medical_services', label: 'Medical Services' },
    { value: 'person', label: 'Person' },
    { value: 'sports_esports', label: 'Sports Esports' },
    { value: 'build', label: 'Build' },
  ];

  // Predefined colors suitable for glassmorphism/liquid glass effects
  // These colors work well with semi-transparent backgrounds and provide good text contrast
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
    const checklistId = this.route.snapshot.paramMap.get('id');
    const isDuplicate = this.route.snapshot.queryParamMap.get('duplicate') === 'true';

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
            color: checklist.color || this.colorOptions[0].value,
          });
        } else {
          // Checklist not found, redirect back
          this.router.navigate(['/']);
        }
      } catch (error) {
        console.error('Error loading checklist:', error);
        this.router.navigate(['/']);
      }
    }
    // For new checklist mode, form is already initialized with default values in constructor
  }

  onCancel(): void {
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
        await this.databaseService.createChecklist({
          title: formValue.title,
          icon: formValue.icon,
          color: formValue.color,
        });
        this.router.navigate(['/']);
      } catch (error) {
        console.error('Error creating checklist:', error);
      }
    }
  }

  async onSave(): Promise<void> {
    if (this.form.valid && this.checklistId) {
      try {
        const formValue = this.form.value;
        await this.databaseService.updateChecklist(this.checklistId, {
          title: formValue.title,
          icon: formValue.icon,
          color: formValue.color,
        });
        this.router.navigate(['/']);
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
    return this.colorOptions.find((color) => color.value === selectedValue);
  }

  async onDuplicate(): Promise<void> {
    if (this.form.valid && this.checklistId) {
      try {
        const formValue = this.form.value;
        // Create the duplicated checklist
        const newChecklistId = await this.databaseService.createChecklist({
          title: formValue.title,
          icon: formValue.icon,
          color: formValue.color,
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

        this.router.navigate(['/']);
      } catch (error) {
        console.error('Error duplicating checklist:', error);
      }
    }
  }
}
