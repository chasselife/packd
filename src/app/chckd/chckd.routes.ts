import { ChecklistItemsComponent } from './pages/checklist-items/checklist-items.component';
import { ChecklistListComponent } from './pages/checklist-list/checklist-list.component';
import { ChecklistComponent } from './pages/checklist/checklist.component';
import { ExportChecklistComponent } from './pages/export-checklist/export-checklist.component';
import { ImportChecklistComponent } from './pages/import-checklist/import-checklist.component';
import { NewChecklistDialogComponent } from './pages/new-checklist-dialog/new-checklist-dialog.component';
import { NewChecklistGroupDialogComponent } from './pages/new-checklist-group-dialog/new-checklist-group-dialog.component';
import { NewChecklistItemDialogComponent } from './pages/new-checklist-item-dialog/new-checklist-item-dialog.component';
import { SearchChecklistComponent } from './pages/search-checklist/search-checklist.component';
import { SeedDataComponent } from './pages/seed-data/seed-data.component';

export default [
  {
    path: '',
    component: ChecklistComponent,
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
    component: ChecklistItemsComponent,
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
  {
    path: 'import',
    component: ImportChecklistComponent,
  },
  {
    path: 'export',
    component: ExportChecklistComponent,
  },
  {
    path: 'checklist-group/new',
    component: NewChecklistGroupDialogComponent,
  },
  {
    path: 'checklist-group/:id/edit',
    component: NewChecklistGroupDialogComponent,
  },
  {
    path: 'checklist-group/:id',
    component: ChecklistListComponent,
  },
  {
    path: 'search',
    component: SearchChecklistComponent,
  },
];
