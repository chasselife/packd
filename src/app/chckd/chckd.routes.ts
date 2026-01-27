import { ChecklistGroupListComponent } from './components/checklist-group-list/checklist-group-list.component';
import { ChecklistItemComponent } from './components/checklist-item/checklist-item.component';
import { ChecklistListComponent } from './components/checklist-list/checklist-list.component';
import { ExportChecklistComponent } from './components/export-checklist/export-checklist.component';
import { ImportChecklistComponent } from './components/import-checklist/import-checklist.component';
import { NewChecklistDialogComponent } from './components/new-checklist-dialog/new-checklist-dialog.component';
import { NewChecklistGroupDialogComponent } from './components/new-checklist-group-dialog/new-checklist-group-dialog.component';
import { NewChecklistItemDialogComponent } from './components/new-checklist-item-dialog/new-checklist-item-dialog.component';
import { SearchChecklistComponent } from './components/search-checklist/search-checklist.component';
import { SeedDataComponent } from './components/seed-data/seed-data.component';

export default [
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
    component: ChecklistGroupListComponent,
  },
  {
    path: 'search',
    component: SearchChecklistComponent,
  },
];
