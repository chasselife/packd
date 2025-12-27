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
  private dialogData = inject<{ checklist?: Checklist }>(MAT_DIALOG_DATA, { optional: true });

  form: FormGroup;
  isEditMode = false;

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
    // Icons from dummy-data.service.ts
    { value: 'outdoor_garden', label: 'Outdoor Garden' },
    { value: 'checkroom', label: 'Checkroom' },
    { value: 'medical_services', label: 'Medical Services' },
    { value: 'person', label: 'Person' },
    { value: 'sports_esports', label: 'Sports Esports' },
    { value: 'build', label: 'Build' },
  ];

  constructor() {
    const checklist = this.dialogData?.checklist;
    this.isEditMode = !!checklist;

    this.form = this.fb.group({
      title: [checklist?.title || '', [Validators.required, Validators.minLength(1)]],
      icon: [checklist?.icon || 'checklist', Validators.required],
    });
  }

  onCancel(): void {
    this.form.reset({
      title: '',
      icon: 'checklist',
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
}
