import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./tab1/tab1.routes').then((m) => m.TAB1_ROUTES),
  },
];
