import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./domains/music/playback/presentation/playback.routes').then((m) => m.PLAYBACK_ROUTES),
  },
];
