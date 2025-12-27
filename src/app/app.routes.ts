import { Routes } from '@angular/router';
import { SeedDataComponent } from './components/seed-data/seed-data.component';
import { ChecklistListComponent } from './components/checklist-list/checklist-list.component';

export const routes: Routes = [
  {
    path: '',
    component: ChecklistListComponent,
  },
  {
    path: 'seed-data',
    component: SeedDataComponent,
  },
];
