import { Component, Input, OnInit } from '@angular/core';
import { Album } from 'src/app/core/models/album';
import { ItemPlaylist } from 'src/app/core/models/item-playlist';
import { PlayerService } from 'src/app/core/services/player.service';

@Component({
  selector: 'app-current-play-list',
  templateUrl: './current-play-list.component.html',
  styleUrls: ['./current-play-list.component.scss'],
})
export class CurrentPlayListComponent {
  @Input() playlist: ItemPlaylist[] = [];
  @Input() currentTrackPosition:number | null | undefined = null;
  constructor(private pService: PlayerService) { }

  clearList(){
    this.pService.clearPlaylist()
    .subscribe((data) => {
      this.playlist = [];
    });
  }

  playItem(position : number){
    const playlistId = 0;
    this.pService.playItem(playlistId, position)
    .subscribe((data) => {
      console.log('playItem', data);
    });
  }

  sendToPlaylist(media: Album | number | any) {
    console.log('sendToPlaylist', media);
    let payload = {};
    if (typeof media === 'number') {
      payload = {songid: media};
    }else {
      payload = {albumid: media.albumid};
    }
    this.pService.setToPlayList(payload,this.playlist.length, 0)
    .subscribe((data) => {
      console.log('setToPlayList', data);
      this.playItem(this.playlist.length + 1)
      
    });
  }
}
