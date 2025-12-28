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

  constructor() {
    // Initialize form with default values to prevent template errors
    this.form = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(1)]],
      description: [''],
      icon: [''],
    });
  }

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

  onCancel(): void {
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
            isDone: false,
            sortOrder: maxSortOrder + 1,
          });
        }

        this.router.navigate(['/checklist', this.checklistId]);
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
}
