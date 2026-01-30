import { Routes } from '@angular/router';
import { AlbumListComponent } from '@domains/music/album';
import { ArtistListComponent } from '@domains/music/artist';
import { GenreListComponent, GenreDetailComponent } from '@domains/music/genre';
import { AppShellComponent } from './components/app-shell/app-shell.component';

export const PLAYBACK_ROUTES: Routes = [
  {
    path: 'collections',
    component: AppShellComponent,
    children: [
      {
        path: 'albums',
        component: AlbumListComponent,
      },
      {
        path: 'artists',
        component: ArtistListComponent,
      },
      {
        path: 'genres',
        component: GenreListComponent,
      },
      {
        path: 'genres/:genreId',
        component: GenreDetailComponent,
      },
    ],
  },
  {
    path: '',
    redirectTo: 'collections/albums',
    pathMatch: 'full',
  },
];
