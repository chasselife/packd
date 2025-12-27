import { Routes } from '@angular/router';
import { SeedDataComponent } from './components/seed-data/seed-data.component';
import { ChecklistListComponent } from './components/checklist-list/checklist-list.component';
import { ChecklistItemComponent } from './components/checklist-item/checklist-item.component';

export const routes: Routes = [
  {
    path: '',
    component: ChecklistListComponent,
  },
  {
    path: 'checklist/:id',
    component: ChecklistItemComponent,
  },
  {
    path: 'seed-data',
    component: SeedDataComponent,
  },
];
