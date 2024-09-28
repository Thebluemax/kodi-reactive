import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { SoundComponent } from './sound/sound.component';
import { PlayerControlComponent } from './player-control/player-control.component';
import { CommonModule } from '@angular/common';
import { CurrentTrackComponent } from './current-track/current-track.component';
import { PipesModule } from '../core/pipes/pipes-module';
import { CurrentPlayListComponent } from './current-play-list/current-play-list.component';
import { ArtistsComponent } from './artists/artists.component';
import { AlbumComponent } from './album/album.component';
import { DirectivesModule } from '../directives/directives.module';
import { AlbumDetailComponent } from './album-detail/album-detail.component';

@NgModule({
  declarations: [
    SoundComponent,
    PlayerControlComponent,
    CurrentTrackComponent,
    CurrentPlayListComponent,
    ArtistsComponent,
    AlbumComponent,
    AlbumDetailComponent
  ],
  exports: [
    SoundComponent,
    PlayerControlComponent,
    CurrentTrackComponent,
    CurrentPlayListComponent,
    ArtistsComponent,
    AlbumComponent,
    AlbumDetailComponent
  ],
  imports: [IonicModule, CommonModule, PipesModule, DirectivesModule],
  providers: [],
})
export class ComponentsModule {}
