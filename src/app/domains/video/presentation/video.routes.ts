import { Routes } from '@angular/router';
import { VideoShellComponent } from './video-shell/video-shell.component';
import { VideoPlaceholderSectionComponent } from './video-placeholder-section.component';

export const VIDEO_ROUTES: Routes = [
  {
    path: '',
    component: VideoShellComponent,
    children: [
      {
        path: 'movies',
        component: VideoPlaceholderSectionComponent,
        data: { title: 'Movies' },
      },
      {
        path: 'tvshows',
        component: VideoPlaceholderSectionComponent,
        data: { title: 'TV Shows' },
      },
      {
        path: 'actors',
        component: VideoPlaceholderSectionComponent,
        data: { title: 'Actors' },
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
