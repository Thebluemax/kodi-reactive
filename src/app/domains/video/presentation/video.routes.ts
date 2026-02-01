import { Routes } from '@angular/router';
import { VideoShellComponent } from './video-shell/video-shell.component';
import { VideoPlaceholderSectionComponent } from './video-placeholder-section.component';
import { MovieListComponent } from '@domains/video/movie';
import { ActorListComponent } from '@domains/video/actor';

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
        component: VideoPlaceholderSectionComponent,
        data: { title: 'TV Shows' },
      },
      {
        path: 'actors',
        component: ActorListComponent,
      },
      {
        path: 'genres',
        component: VideoPlaceholderSectionComponent,
        data: { title: 'Genres' },
      },
      {
        path: '',
        redirectTo: 'movies',
        pathMatch: 'full',
      },
    ],
  },
];
