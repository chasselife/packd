import { Injectable } from '@angular/core';
import { Checklist, ChecklistItem } from '../models/checklist.model';
import { DatabaseService } from './database.service';
import {
  CHECKLIST_ICON_OPTIONS,
  CHECKLIST_ITEM_ICON_OPTIONS,
} from '../constants/icon-options.constant';

interface ChecklistTemplate {
  title: string;
  icon?: string;
  color?: string;
  items: Array<{
    title: string;
    description?: string;
    icon?: string;
    isDone?: boolean;
    subItems?: string[];
  }>;
}

@Injectable({
  providedIn: 'root',
})
export class SeedDataService {
  constructor(private databaseService: DatabaseService) {}

  // Note: Icons used in templates should be from CHECKLIST_ICON_OPTIONS (for checklist icons)
  // and CHECKLIST_ITEM_ICON_OPTIONS (for item icons) to ensure consistency across the app
  private readonly checklistTemplates: ChecklistTemplate[] = [
    {
      title: 'Camping Essentials',
      icon: 'camping',
      color: '#1d93c8', // Emerald
      items: [
        {
          title: 'Tent',
          description: 'Weatherproof tent with rainfly',
          icon: 'home',
          subItems: ['Tent poles', 'Rainfly', 'Tent stakes', 'Guy lines', 'Footprint/ground cloth'],
        },
        {
          title: 'Sleeping Bag',
          description: 'Warm sleeping bag suitable for the season',
          icon: 'hotel',
          subItems: ['Sleeping bag liner', 'Compression sack', 'Pillow'],
        },
        {
          title: 'Sleeping Pad',
          description: 'Inflatable or foam sleeping pad',
          icon: 'airline_seat_flat',
          isDone: true,
          subItems: ['Pump (if inflatable)', 'Repair kit'],
        },
        {
          title: 'Camping Stove',
          description: 'Portable stove with fuel',
          icon: 'local_fire_department',
          subItems: ['Fuel canisters', 'Lighter', 'Wind screen', 'Pot holder'],
        },
        {
          title: 'Headlamp',
          description: 'LED headlamp with extra batteries',
          icon: 'light_mode',
          subItems: ['Extra batteries', 'Backup headlamp'],
        },
        {
          title: 'Camping Chairs',
          description: 'Portable folding chairs',
          icon: 'chair',
          subItems: ['Camp table (optional)'],
        },
        {
          title: 'Lantern',
          description: 'Battery or solar-powered lantern',
          icon: 'lightbulb',
          subItems: ['Extra batteries', 'Solar panel (if solar)'],
        },
        {
          title: 'Tarp',
          description: 'Waterproof tarp for ground cover',
          icon: 'layers',
          subItems: ['Rope', 'Tarp stakes'],
        },
      ],
    },
    {
      title: 'Cooking Supplies',
      icon: 'restaurant',
      color: '#f97316', // Orange
      items: [
        {
          title: 'Cookware Set',
          description: 'Pots, pans, and utensils',
          icon: 'soup_kitchen',
          subItems: ['Pot (2-3qt)', 'Pan', 'Spatula', 'Serving spoon', 'Tongs', 'Pot gripper'],
        },
        {
          title: 'Cooler',
          description: 'Insulated cooler with ice packs',
          icon: 'ac_unit',
          isDone: true,
          subItems: ['Ice packs', 'Ice', 'Cooler thermometer'],
        },
        {
          title: 'Water Bottles',
          description: 'Reusable water bottles or hydration system',
          icon: 'water_drop',
          subItems: ['Water filter', 'Water purification tablets', 'Hydration bladder'],
        },
        {
          title: 'Cutting Board',
          description: 'Portable cutting board',
          icon: 'content_cut',
          subItems: ['Knife set', 'Knife sharpener'],
        },
        {
          title: 'Coffee Maker',
          description: 'Portable coffee maker or French press',
          icon: 'local_cafe',
          subItems: ['Coffee grounds', 'Filters (if needed)', 'Sugar', 'Creamer'],
        },
        {
          title: 'Can Opener',
          description: 'Manual can opener',
          icon: 'settings',
          subItems: ['Bottle opener', 'Corkscrew'],
        },
        {
          title: 'Dish Soap',
          description: 'Biodegradable dish soap',
          icon: 'cleaning_services',
          subItems: ['Sponge', 'Dish towel', 'Wash basin'],
        },
        {
          title: 'Paper Towels',
          description: 'Roll of paper towels',
          icon: 'receipt',
          subItems: ['Trash bags', 'Ziploc bags'],
        },
        {
          title: 'Aluminum Foil',
          description: 'Heavy-duty aluminum foil',
          icon: 'layers',
          subItems: ['Plastic wrap', 'Storage containers'],
        },
        {
          title: 'Matches/Lighter',
          description: 'Waterproof matches or lighter',
          icon: 'local_fire_department',
          subItems: ['Fire starter', 'Firewood'],
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
          subItems: ['Hiking socks', 'Boot laces (extra)', 'Boot waterproofing spray'],
        },
        {
          title: 'Rain Jacket',
          description: 'Waterproof rain jacket',
          icon: 'umbrella',
          isDone: true,
          subItems: ['Rain pants', 'Pack cover'],
        },
        {
          title: 'Warm Layers',
          description: 'Fleece or wool layers for cold nights',
          icon: 'thermostat',
          subItems: ['Fleece jacket', 'Wool sweater', 'Down vest'],
        },
        {
          title: 'Extra Socks',
          description: 'Multiple pairs of moisture-wicking socks',
          icon: 'inventory_2',
          subItems: ['Wool socks (3-4 pairs)', 'Liner socks'],
        },
        {
          title: 'Hat',
          description: 'Sun hat or beanie depending on weather',
          icon: 'checkroom',
          subItems: ['Sun hat', 'Beanie', 'Buff/neck gaiter'],
        },
        {
          title: 'Gloves',
          description: 'Warm gloves for cold weather',
          icon: 'back_hand',
          subItems: ['Liner gloves', 'Waterproof gloves'],
        },
        {
          title: 'Base Layers',
          description: 'Moisture-wicking base layer clothing',
          icon: 'checkroom',
          subItems: ['Long underwear top', 'Long underwear bottom'],
        },
        {
          title: 'Swimwear',
          description: 'Swimsuit or swim trunks',
          icon: 'pool',
          subItems: ['Quick-dry towel', 'Water shoes'],
        },
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
          subItems: [
            'Bandages',
            'Antiseptic wipes',
            'Pain relievers',
            'Antihistamine',
            'Tweezers',
            'Medical tape',
          ],
        },
        {
          title: 'Whistle',
          description: 'Emergency whistle for signaling',
          icon: 'volume_up',
          subItems: ['Signal mirror', 'Emergency beacon'],
        },
        {
          title: 'Multi-tool',
          description: 'Swiss Army knife or multi-tool',
          icon: 'build',
          isDone: true,
          subItems: ['Pocket knife', 'Duct tape'],
        },
        {
          title: 'Map & Compass',
          description: 'Topographic map and compass',
          icon: 'map',
          subItems: ['GPS device', 'Trail guide', 'Compass (backup)'],
        },
        {
          title: 'Emergency Blanket',
          description: 'Space blanket for emergency warmth',
          icon: 'emergency',
          subItems: ['Emergency shelter', 'Hand warmers'],
        },
        {
          title: 'Flashlight',
          description: 'Extra flashlight with batteries',
          icon: 'flashlight_on',
          subItems: ['Extra batteries', 'Backup flashlight', 'Glow sticks'],
        },
        {
          title: 'Fire Starter',
          description: 'Waterproof fire starter kit',
          icon: 'local_fire_department',
          subItems: ['Waterproof matches', 'Lighter', 'Fire starter cubes'],
        },
      ],
    },
    {
      title: 'Personal Items',
      icon: 'person',
      color: '#8b5cf6', // Purple
      items: [
        {
          title: 'Toiletries',
          description: 'Toothbrush, toothpaste, soap, etc.',
          icon: 'bath',
          subItems: ['Toothbrush', 'Toothpaste', 'Soap', 'Shampoo', 'Deodorant', 'Razor'],
        },
        {
          title: 'Sunscreen',
          description: 'SPF 30+ sunscreen',
          icon: 'wb_sunny',
          subItems: ['SPF 50+', 'Lip balm with SPF', 'After-sun lotion'],
        },
        {
          title: 'Insect Repellent',
          description: 'DEET or natural insect repellent',
          icon: 'bug_report',
          isDone: true,
          subItems: ['DEET spray', 'Natural repellent', 'Mosquito net'],
        },
        {
          title: 'Towel',
          description: 'Quick-dry camping towel',
          icon: 'dry_cleaning',
          subItems: ['Face towel', 'Hand towel'],
        },
        {
          title: 'Portable Charger',
          description: 'Power bank for charging devices',
          icon: 'battery_charging_full',
          subItems: ['USB cables', 'Solar charger', 'Car adapter'],
        },
        {
          title: 'Hand Sanitizer',
          description: 'Alcohol-based hand sanitizer',
          icon: 'sanitizer',
          subItems: ['Hand soap', 'Wet wipes'],
        },
        {
          title: 'Wet Wipes',
          description: 'Biodegradable wet wipes',
          icon: 'cleaning_services',
          subItems: ['Baby wipes', 'Disinfecting wipes'],
        },
      ],
    },
    {
      title: 'Entertainment',
      icon: 'sports_esports',
      color: '#f59e0b', // Amber
      items: [
        {
          title: 'Books',
          description: 'Reading materials for downtime',
          icon: 'menu_book',
          subItems: ['E-reader', 'Book light', 'Bookmark'],
        },
        {
          title: 'Playing Cards',
          description: 'Deck of playing cards',
          icon: 'style',
          subItems: ['Multiple decks', 'Card games guide'],
        },
        {
          title: 'Board Games',
          description: 'Portable board games',
          icon: 'sports_esports',
          subItems: ['Travel games', 'Dice', 'Score pad'],
        },
        {
          title: 'Fishing Gear',
          description: 'Fishing rod, tackle, and license',
          icon: 'sports_volleyball',
          subItems: ['Fishing rod', 'Tackle box', 'Fishing license', 'Bait', 'Fishing line'],
        },
        {
          title: 'Camera',
          description: 'Camera or smartphone for photos',
          icon: 'camera_alt',
          subItems: ['Extra memory cards', 'Camera batteries', 'Tripod', 'Lens cleaner'],
        },
        {
          title: 'Binoculars',
          description: 'Binoculars for wildlife viewing',
          icon: 'visibility',
          subItems: ['Binocular case', 'Lens cleaning cloth'],
        },
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
          subItems: ['Tire patches', 'Tire sealant', 'Air compressor', 'Tire pressure gauge'],
        },
        {
          title: 'Jumper Cables',
          description: 'Heavy-duty jumper cables',
          icon: 'cable',
          subItems: ['Portable jump starter', 'Battery terminals'],
        },
        {
          title: 'Tool Kit',
          description: 'Basic automotive tool kit',
          icon: 'construction',
          subItems: ['Screwdrivers', 'Wrenches', 'Pliers', 'Hammer'],
        },
        {
          title: 'Spare Tire',
          description: 'Check spare tire pressure',
          icon: 'tire_repair',
          isDone: true,
          subItems: ['Lug wrench', 'Jack', 'Wheel chocks'],
        },
        {
          title: 'Road Flares',
          description: 'Emergency road flares',
          icon: 'warning',
          subItems: ['Reflective triangles', 'Emergency vest'],
        },
        {
          title: 'Car Charger',
          description: 'USB car charger adapter',
          icon: 'charging_station',
          subItems: ['Multiple USB ports', 'Cigarette lighter adapter'],
        },
        {
          title: 'GPS Device',
          description: 'GPS navigation device or app',
          icon: 'navigation',
          subItems: ['GPS mount', 'Offline maps', 'Compass app'],
        },
        {
          title: 'Towing Rope',
          description: 'Heavy-duty towing rope',
          icon: 'cable',
          subItems: ['Recovery strap', 'Shackles', 'Winch (if applicable)'],
        },
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

  async seedInitialData(): Promise<void> {
    // Check if seeding has already happened (using localStorage flag)
    const hasSeededKey = 'packd_has_seeded_data';
    const hasSeeded = localStorage.getItem(hasSeededKey);
    if (hasSeeded === 'true') {
      return; // Already seeded once, don't seed again even if data was deleted
    }

    // Check if checklist groups already exist
    const existingGroups = await this.databaseService.getAllChecklistGroups();
    if (existingGroups.length > 0) {
      // Mark as seeded if groups exist (in case flag was cleared)
      localStorage.setItem(hasSeededKey, 'true');
      return; // Data already exists, don't seed
    }

    // Create the "Camping Checklists" group
    const groupId = await this.databaseService.createChecklistGroup({
      title: 'Camping Checklists',
      icon: 'camping',
      color: '#1d93c8', // Emerald
    });

    // Create checklists with random number of items (between 3-10 items per checklist)
    for (const template of this.checklistTemplates) {
      // Generate random number of items (min 3, max the total available items or 10, whichever is smaller)
      const minItems = 3;
      const maxItems = Math.min(template.items.length, 10);
      const itemCount = this.getRandomInt(minItems, maxItems);

      // Get random selection of items
      const selectedItems = this.getRandomItems(template.items, itemCount);

      // Create the checklist using Checklist model
      const checklist: Omit<Checklist, 'id' | 'sortOrder' | 'createdAt' | 'updatedAt'> = {
        title: template.title,
        icon: template.icon,
        color: template.color || '#1d93c8', // Default to emerald if no color specified
        groupId, // Assign to the "Camping Checklists" group
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
          subItems: itemTemplate.subItems || [],
          sortOrder: i + 1,
        };
        await this.databaseService.createChecklistItem(checklistItem);
      }
    }

    // Mark as seeded so it won't happen again even if data is deleted
    localStorage.setItem(hasSeededKey, 'true');
  }

  async clearAllData(): Promise<void> {
    // Delete all checklists
    const checklists = await this.databaseService.getAllChecklists();
    for (const checklist of checklists) {
      if (checklist.id) {
        await this.databaseService.deleteChecklist(checklist.id);
      }
    }

    // Delete all checklist groups
    const groups = await this.databaseService.getAllChecklistGroups();
    for (const group of groups) {
      if (group.id) {
        await this.databaseService.deleteChecklistGroup(group.id);
      }
    }
  }
}
