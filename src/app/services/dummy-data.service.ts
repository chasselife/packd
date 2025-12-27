import { Injectable } from '@angular/core';
import { Checklist, ChecklistItem } from '../models/checklist.model';
import { DatabaseService } from './database.service';

interface ChecklistTemplate {
  title: string;
  icon?: string;
  color?: string;
  items: Array<{
    title: string;
    description?: string;
    icon?: string;
    isDone?: boolean;
  }>;
}

@Injectable({
  providedIn: 'root',
})
export class DummyDataService {
  constructor(private databaseService: DatabaseService) {}

  private readonly checklistTemplates: ChecklistTemplate[] = [
    {
      title: 'Camping Essentials',
      icon: 'camping',
      color: '#53b87d', // Emerald
      items: [
        { title: 'Tent', description: 'Weatherproof tent with rainfly', icon: 'home' },
        {
          title: 'Sleeping Bag',
          description: 'Warm sleeping bag suitable for the season',
          icon: 'hotel',
        },
        {
          title: 'Sleeping Pad',
          description: 'Inflatable or foam sleeping pad',
          icon: 'airline_seat_flat',
          isDone: true,
        },
        {
          title: 'Camping Stove',
          description: 'Portable stove with fuel',
          icon: 'local_fire_department',
        },
        { title: 'Headlamp', description: 'LED headlamp with extra batteries', icon: 'light_mode' },
        { title: 'Camping Chairs', description: 'Portable folding chairs', icon: 'chair' },
        { title: 'Lantern', description: 'Battery or solar-powered lantern', icon: 'lightbulb' },
        { title: 'Tarp', description: 'Waterproof tarp for ground cover', icon: 'layers' },
      ],
    },
    {
      title: 'Cooking Supplies',
      icon: 'restaurant',
      color: '#f97316', // Orange
      items: [
        { title: 'Cookware Set', description: 'Pots, pans, and utensils', icon: 'soup_kitchen' },
        {
          title: 'Cooler',
          description: 'Insulated cooler with ice packs',
          icon: 'ac_unit',
          isDone: true,
        },
        {
          title: 'Water Bottles',
          description: 'Reusable water bottles or hydration system',
          icon: 'water_drop',
        },
        { title: 'Cutting Board', description: 'Portable cutting board', icon: 'content_cut' },
        {
          title: 'Coffee Maker',
          description: 'Portable coffee maker or French press',
          icon: 'local_cafe',
        },
        { title: 'Can Opener', description: 'Manual can opener', icon: 'settings' },
        { title: 'Dish Soap', description: 'Biodegradable dish soap', icon: 'cleaning_services' },
        { title: 'Paper Towels', description: 'Roll of paper towels', icon: 'receipt' },
        { title: 'Aluminum Foil', description: 'Heavy-duty aluminum foil', icon: 'layers' },
        {
          title: 'Matches/Lighter',
          description: 'Waterproof matches or lighter',
          icon: 'local_fire_department',
        },
      ],
    },
    {
      title: 'Clothing',
      icon: 'checkroom',
      color: '#3b82f6', // Blue
      items: [
        {
          title: 'Hiking Boots',
          description: 'Comfortable, waterproof hiking boots',
          icon: 'directions_walk',
        },
        {
          title: 'Rain Jacket',
          description: 'Waterproof rain jacket',
          icon: 'umbrella',
          isDone: true,
        },
        {
          title: 'Warm Layers',
          description: 'Fleece or wool layers for cold nights',
          icon: 'thermostat',
        },
        {
          title: 'Extra Socks',
          description: 'Multiple pairs of moisture-wicking socks',
          icon: 'inventory_2',
        },
        { title: 'Hat', description: 'Sun hat or beanie depending on weather', icon: 'checkroom' },
        { title: 'Gloves', description: 'Warm gloves for cold weather', icon: 'back_hand' },
        {
          title: 'Base Layers',
          description: 'Moisture-wicking base layer clothing',
          icon: 'checkroom',
        },
        { title: 'Swimwear', description: 'Swimsuit or swim trunks', icon: 'pool' },
      ],
    },
    {
      title: 'Safety & First Aid',
      icon: 'medical_services',
      color: '#ec4899', // Pink
      items: [
        {
          title: 'First Aid Kit',
          description: 'Complete first aid kit with bandages and medications',
          icon: 'medical_services',
        },
        { title: 'Whistle', description: 'Emergency whistle for signaling', icon: 'volume_up' },
        {
          title: 'Multi-tool',
          description: 'Swiss Army knife or multi-tool',
          icon: 'build',
          isDone: true,
        },
        { title: 'Map & Compass', description: 'Topographic map and compass', icon: 'map' },
        {
          title: 'Emergency Blanket',
          description: 'Space blanket for emergency warmth',
          icon: 'emergency',
        },
        {
          title: 'Flashlight',
          description: 'Extra flashlight with batteries',
          icon: 'flashlight_on',
        },
        {
          title: 'Fire Starter',
          description: 'Waterproof fire starter kit',
          icon: 'local_fire_department',
        },
      ],
    },
    {
      title: 'Personal Items',
      icon: 'person',
      color: '#8b5cf6', // Purple
      items: [
        { title: 'Toiletries', description: 'Toothbrush, toothpaste, soap, etc.', icon: 'bath' },
        { title: 'Sunscreen', description: 'SPF 30+ sunscreen', icon: 'wb_sunny' },
        {
          title: 'Insect Repellent',
          description: 'DEET or natural insect repellent',
          icon: 'bug_report',
          isDone: true,
        },
        { title: 'Towel', description: 'Quick-dry camping towel', icon: 'dry_cleaning' },
        {
          title: 'Portable Charger',
          description: 'Power bank for charging devices',
          icon: 'battery_charging_full',
        },
        { title: 'Hand Sanitizer', description: 'Alcohol-based hand sanitizer', icon: 'sanitizer' },
        { title: 'Wet Wipes', description: 'Biodegradable wet wipes', icon: 'cleaning_services' },
      ],
    },
    {
      title: 'Entertainment',
      icon: 'sports_esports',
      color: '#f59e0b', // Amber
      items: [
        { title: 'Books', description: 'Reading materials for downtime', icon: 'menu_book' },
        { title: 'Playing Cards', description: 'Deck of playing cards', icon: 'style' },
        { title: 'Board Games', description: 'Portable board games', icon: 'sports_esports' },
        {
          title: 'Fishing Gear',
          description: 'Fishing rod, tackle, and license',
          icon: 'sports_volleyball',
        },
        { title: 'Camera', description: 'Camera or smartphone for photos', icon: 'camera_alt' },
        { title: 'Binoculars', description: 'Binoculars for wildlife viewing', icon: 'visibility' },
      ],
    },
    {
      title: 'Vehicle & Tools',
      icon: 'build',
      color: '#6366f1', // Indigo
      items: [
        {
          title: 'Tire Repair Kit',
          description: 'Tire patch kit and air compressor',
          icon: 'build',
        },
        { title: 'Jumper Cables', description: 'Heavy-duty jumper cables', icon: 'cable' },
        { title: 'Tool Kit', description: 'Basic automotive tool kit', icon: 'construction' },
        {
          title: 'Spare Tire',
          description: 'Check spare tire pressure',
          icon: 'tire_repair',
          isDone: true,
        },
        { title: 'Road Flares', description: 'Emergency road flares', icon: 'warning' },
        { title: 'Car Charger', description: 'USB car charger adapter', icon: 'charging_station' },
        { title: 'GPS Device', description: 'GPS navigation device or app', icon: 'navigation' },
        { title: 'Towing Rope', description: 'Heavy-duty towing rope', icon: 'cable' },
      ],
    },
  ];

  private getRandomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  private getRandomItems<T>(items: T[], count: number): T[] {
    const shuffled = [...items].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  async seedDummyData(): Promise<void> {
    // Check if data already exists
    const existingChecklists = await this.databaseService.getAllChecklists();
    if (existingChecklists.length > 0) {
      return; // Data already exists
    }

    // Create checklists with random number of items (between 3-10 items per checklist)
    for (const template of this.checklistTemplates) {
      // Generate random number of items (min 3, max the total available items or 10, whichever is smaller)
      const minItems = 3;
      const maxItems = Math.min(template.items.length, 10);
      const itemCount = this.getRandomInt(minItems, maxItems);

      // Get random selection of items
      const selectedItems = this.getRandomItems(template.items, itemCount);

      // Create the checklist using Checklist model
      const checklist: Omit<Checklist, 'id' | 'createdAt' | 'updatedAt'> = {
        title: template.title,
        icon: template.icon,
        color: template.color || '#53b87d', // Default to emerald if no color specified
      };
      const checklistId = await this.databaseService.createChecklist(checklist);

      // Create checklist items using ChecklistItem model
      for (let i = 0; i < selectedItems.length; i++) {
        const itemTemplate = selectedItems[i];
        const checklistItem: Omit<ChecklistItem, 'id' | 'createdAt' | 'updatedAt'> = {
          checklistId,
          title: itemTemplate.title,
          description: itemTemplate.description,
          icon: itemTemplate.icon,
          isDone: itemTemplate.isDone ?? false,
          sortOrder: i + 1,
        };
        await this.databaseService.createChecklistItem(checklistItem);
      }
    }
  }

  async clearAllData(): Promise<void> {
    const checklists = await this.databaseService.getAllChecklists();
    for (const checklist of checklists) {
      if (checklist.id) {
        await this.databaseService.deleteChecklist(checklist.id);
      }
    }
  }
}
