import { Routes } from '@angular/router';
import { AlbumListComponent } from '@domains/music/album';
import { ArtistListComponent } from '@domains/music/artist';
import { GenreListComponent, GenreDetailComponent } from '@domains/music/genre';
import { MusicShellComponent } from './music-shell.component';

export const MUSIC_ROUTES: Routes = [
  {
    path: '',
    component: MusicShellComponent,
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
      {
        path: '',
        redirectTo: 'albums',
        pathMatch: 'full',
      },
    ],
  },
];
