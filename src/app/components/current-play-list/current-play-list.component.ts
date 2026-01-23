import { Component, Input, inject } from '@angular/core';
import { Album } from 'src/app/core/models/album';
import { ItemPlaylist } from 'src/app/core/models/item-playlist';
import { PlayerService } from 'src/app/core/services/player.service';
import { IonicModule } from '@ionic/angular';
import { NgFor } from '@angular/common';
import { AssetsPipe } from '../../core/pipes/assets.pipe';

@Component({
    selector: 'app-current-play-list',
    templateUrl: './current-play-list.component.html',
    styleUrls: ['./current-play-list.component.scss'],
    imports: [IonicModule, NgFor, AssetsPipe]
})
export class CurrentPlayListComponent {
  private pService = inject(PlayerService);

  @Input() playlist: ItemPlaylist[] = [];
  @Input() currentTrackPosition: number | null | undefined = null;
  @Input() playlistId: number = 0;
  
  clearList() {
    this.pService.clearPlaylist().subscribe((data) => {
      this.playlist = [];
    });
  }
  
  playItem(position: number) {
    this.pService.playItem(this.playlistId, position)
    .subscribe((data) => {
      console.log('playItem', data);
    });
  }
  
  sendToPlaylist(event: any) {
    {
      console.log('sendToPlaylist', event);
      let payload = {};
      if (event.media.songid) {
        payload = { songid: event.media };
      } else {
        payload = { albumid: event.media.albumid };
      }
      
      this.pService
      .setToPlayList(payload, this.playlist.length, 0)
      .subscribe((data) => {
        console.log('setToPlayList play it ', event.playMedia, data);
        if (event.playMedia) {
          this.playItem(this.playlist.length);
        }
      });
    }
  }
}
