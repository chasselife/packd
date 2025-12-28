import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ChecklistItem } from '../../models/checklist.model';

@Component({
  selector: 'app-new-checklist-item-dialog',
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
  templateUrl: './new-checklist-item-dialog.component.html',
})
export class NewChecklistItemDialogComponent {
  private fb = inject(FormBuilder);
  public dialogRef = inject(MatDialogRef<NewChecklistItemDialogComponent>);
  public data = inject<{ item?: ChecklistItem }>(MAT_DIALOG_DATA, { optional: true });

  form: FormGroup;
  isEditMode = false;

  // Popular Material Icons for checklist items
  icons = [
    { value: '', label: 'None' },
    { value: 'check_circle', label: 'Check Circle' },
    { value: 'radio_button_unchecked', label: 'Unchecked' },
    { value: 'star', label: 'Star' },
    { value: 'favorite', label: 'Favorite' },
    { value: 'bookmark', label: 'Bookmark' },
    { value: 'flag', label: 'Flag' },
    { value: 'label', label: 'Label' },
    { value: 'local_offer', label: 'Tag' },
    { value: 'shopping_bag', label: 'Shopping Bag' },
    { value: 'shopping_cart', label: 'Shopping Cart' },
    { value: 'backpack', label: 'Backpack' },
    { value: 'luggage', label: 'Luggage' },
    { value: 'toys', label: 'Toys' },
    { value: 'sports_soccer', label: 'Sports' },
    { value: 'pool', label: 'Pool' },
    { value: 'beach_access', label: 'Beach' },
    { value: 'camping', label: 'Camping' },
    { value: 'hiking', label: 'Hiking' },
    { value: 'directions_bike', label: 'Biking' },
    { value: 'restaurant', label: 'Restaurant' },
    { value: 'local_dining', label: 'Dining' },
    { value: 'hotel', label: 'Hotel' },
    { value: 'flight', label: 'Flight' },
    { value: 'directions_car', label: 'Car' },
    { value: 'phone', label: 'Phone' },
    { value: 'laptop', label: 'Laptop' },
    { value: 'camera', label: 'Camera' },
    { value: 'camera_alt', label: 'Camera Alt' },
    { value: 'headphones', label: 'Headphones' },
    { value: 'book', label: 'Book' },
    { value: 'menu_book', label: 'Menu Book' },
    { value: 'music_note', label: 'Music' },
    { value: 'movie', label: 'Movie' },
    { value: 'videogame_asset', label: 'Games' },
    { value: 'fitness_center', label: 'Fitness' },
    { value: 'snowboarding', label: 'Winter Sports' },
    { value: 'umbrella', label: 'Umbrella' },
    { value: 'wb_sunny', label: 'Sun' },
    { value: 'ac_unit', label: 'AC Unit' },
    { value: 'water_drop', label: 'Water' },
    { value: 'local_pharmacy', label: 'Pharmacy' },
    { value: 'medical_services', label: 'Medical' },
    { value: 'cleaning_services', label: 'Cleaning' },
    { value: 'home', label: 'Home' },
    { value: 'work', label: 'Work' },
    { value: 'school', label: 'School' },
    // Icons from seed-data.service.ts
    { value: 'airline_seat_flat', label: 'Airline Seat Flat' },
    { value: 'local_fire_department', label: 'Fire Department' },
    { value: 'light_mode', label: 'Light Mode' },
    { value: 'chair', label: 'Chair' },
    { value: 'lightbulb', label: 'Lightbulb' },
    { value: 'layers', label: 'Layers' },
    { value: 'soup_kitchen', label: 'Soup Kitchen' },
    { value: 'content_cut', label: 'Content Cut' },
    { value: 'local_cafe', label: 'Local Cafe' },
    { value: 'settings', label: 'Settings' },
    { value: 'receipt', label: 'Receipt' },
    { value: 'directions_walk', label: 'Directions Walk' },
    { value: 'thermostat', label: 'Thermostat' },
    { value: 'inventory_2', label: 'Inventory' },
    { value: 'back_hand', label: 'Back Hand' },
    { value: 'volume_up', label: 'Volume Up' },
    { value: 'map', label: 'Map' },
    { value: 'emergency', label: 'Emergency' },
    { value: 'flashlight_on', label: 'Flashlight On' },
    { value: 'bath', label: 'Bath' },
    { value: 'bug_report', label: 'Bug Report' },
    { value: 'dry_cleaning', label: 'Dry Cleaning' },
    { value: 'battery_charging_full', label: 'Battery Charging Full' },
    { value: 'sanitizer', label: 'Sanitizer' },
    { value: 'style', label: 'Style' },
    { value: 'sports_volleyball', label: 'Sports Volleyball' },
    { value: 'visibility', label: 'Visibility' },
    { value: 'cable', label: 'Cable' },
    { value: 'construction', label: 'Construction' },
    { value: 'tire_repair', label: 'Tire Repair' },
    { value: 'warning', label: 'Warning' },
    { value: 'charging_station', label: 'Charging Station' },
    { value: 'navigation', label: 'Navigation' },
    { value: 'build', label: 'Build' },
  ];

  constructor() {
    const item = this.data?.item;
    this.isEditMode = !!item;

    this.form = this.fb.group({
      title: [item?.title || '', [Validators.required, Validators.minLength(1)]],
      description: [item?.description || ''],
      icon: [item?.icon || ''],
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value);
    }
  }

  getSelectedIcon(): { value: string; label: string } | undefined {
    const selectedValue = this.form.get('icon')?.value;
    if (!selectedValue) return undefined;
    return this.icons.find((icon) => icon.value === selectedValue);
  }
}
