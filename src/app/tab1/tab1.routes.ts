import { Routes } from '@angular/router';
import { Tab1Page } from './tab1.page';
import { AlbumListComponent } from '@domains/music/album';
import { ArtistsComponent } from '../components/artists/artists.component';
import { GenresComponent } from '../components/genres/genres.component';

export const TAB1_ROUTES: Routes = [
  {
    path: 'collections',
    component: Tab1Page,
    children: [
      {
        path: 'albums',
        component: AlbumListComponent,
      },
      {
        path: 'artists',
        component: ArtistsComponent,
      },
      {
        path: 'genres',
        component: GenresComponent,
      },
    ],
  },
  {
    path: '',
    redirectTo: 'collections/albums',
    pathMatch: 'full',
  },
];
