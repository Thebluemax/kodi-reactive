import { Routes } from '@angular/router';
import { VideoShellComponent } from './video-shell/video-shell.component';
import { MovieListComponent } from '@domains/video/movie';
import { ActorListComponent } from '@domains/video/actor';
import { TVShowListComponent } from '@domains/video/tvshow';
import { VideoGenreListComponent } from '@domains/video/genre';

export const VIDEO_ROUTES: Routes = [
  {
    path: '',
    component: VideoShellComponent,
    children: [
      {
        path: 'movies',
        component: MovieListComponent,
      },
      {
        path: 'tvshows',
        component: TVShowListComponent,
      },
      {
        path: 'actors',
        component: ActorListComponent,
      },
      {
        path: 'genres',
        component: VideoGenreListComponent,
      },
      {
        path: '',
        redirectTo: 'movies',
        pathMatch: 'full',
      },
    ],
  },
];
