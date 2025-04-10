import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Tab1Page } from './tab1.page';
import { AlbumComponent } from '../components/album/album.component';

const routes: Routes = [
  {
    path: 'media',
    component: Tab1Page,
    children: [
      {
        path: 'albums',
        component: AlbumComponent,
      },
    ],
  },
  {
    path: '',
    redirectTo: 'media/albums',
    pathMatch: 'full',
  },
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class Tab1PageRoutingModule {}
