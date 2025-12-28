import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Checklist } from '../../models/checklist.model';

@Component({
  selector: 'app-new-checklist-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './new-checklist-dialog.component.html',
})
export class NewChecklistDialogComponent {
  private fb = inject(FormBuilder);
  public dialogRef = inject(MatDialogRef<NewChecklistDialogComponent>);
  public dialogData = inject<{ checklist?: Checklist; isDuplicate?: boolean; items?: any[] }>(
    MAT_DIALOG_DATA,
    { optional: true }
  );

  form: FormGroup;
  isEditMode = false;
  isDuplicateMode = false;

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

  constructor() {
    const checklist = this.dialogData?.checklist;
    this.isDuplicateMode = !!this.dialogData?.isDuplicate;
    this.isEditMode = !!checklist && !this.isDuplicateMode;

    // Automatically append "Copy" to the title in duplicate mode
    const title =
      this.isDuplicateMode && checklist?.title ? `${checklist.title} Copy` : checklist?.title || '';

    this.form = this.fb.group({
      title: [title, [Validators.required, Validators.minLength(1)]],
      icon: [checklist?.icon || 'checklist', Validators.required],
      color: [checklist?.color || this.colorOptions[0].value, Validators.required],
    });
  }

  onCancel(): void {
    this.form.reset({
      title: '',
      icon: 'checklist',
      color: this.colorOptions[0].value,
    });
    this.dialogRef.close();
  }

  onCreate(): void {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value);
    }
  }

  onSave(): void {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value);
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
}
