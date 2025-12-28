import { Routes } from '@angular/router';
import { SeedDataComponent } from './components/seed-data/seed-data.component';
import { ChecklistListComponent } from './components/checklist-list/checklist-list.component';
import { ChecklistItemComponent } from './components/checklist-item/checklist-item.component';
import { NewChecklistDialogComponent } from './components/new-checklist-dialog/new-checklist-dialog.component';
import { NewChecklistItemDialogComponent } from './components/new-checklist-item-dialog/new-checklist-item-dialog.component';

export const routes: Routes = [
  {
    path: '',
    component: ChecklistListComponent,
  },
  {
    path: 'checklist/new',
    component: NewChecklistDialogComponent,
  },
  {
    path: 'checklist/:id/edit',
    component: NewChecklistDialogComponent,
  },
  {
    path: 'checklist/:id',
    component: ChecklistItemComponent,
  },
  {
    path: 'checklist/:checklistId/item/new',
    component: NewChecklistItemDialogComponent,
  },
  {
    path: 'checklist/:checklistId/item/:itemId/edit',
    component: NewChecklistItemDialogComponent,
  },
  {
    path: 'seed-data',
    component: SeedDataComponent,
  },
];
