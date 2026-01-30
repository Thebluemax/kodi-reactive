import { Routes } from '@angular/router';
import { AppShellComponent } from './app-shell.component';

export const LAYOUT_ROUTES: Routes = [
  {
    path: '',
    component: AppShellComponent,
    children: [
      {
        path: 'music',
        loadChildren: () =>
          import('../domains/music/playback/presentation/music.routes').then(
            (m) => m.MUSIC_ROUTES
          ),
      },
      {
        path: 'video',
        loadComponent: () =>
          import('./video-placeholder.component').then(
            (m) => m.VideoPlaceholderComponent
          ),
      },
      {
        path: '',
        redirectTo: 'music',
        pathMatch: 'full',
      },
    ],
  },
];
