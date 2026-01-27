import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'chckd',
    loadChildren: () => import('./chckd/chckd.routes'),
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'chckd',
  },
];
