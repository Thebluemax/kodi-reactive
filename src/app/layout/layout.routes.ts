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
        loadChildren: () =>
          import('../domains/video/presentation/video.routes').then(
            (m) => m.VIDEO_ROUTES
          ),
      },
      {
        path: 'remote',
        loadChildren: () =>
          import('../domains/remote/presentation/remote.routes').then(
            (m) => m.REMOTE_ROUTES
          ),
      },
      {
        path: 'playlists',
        loadComponent: () =>
          import('../domains/music/playlist/presentation/components/saved-playlist-list/saved-playlist-list.component').then(
            (m) => m.SavedPlaylistListComponent
          ),
      },
      {
        path: 'settings',
        loadChildren: () =>
          import('../domains/settings/presentation/settings.routes').then(
            (m) => m.SETTINGS_ROUTES
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
