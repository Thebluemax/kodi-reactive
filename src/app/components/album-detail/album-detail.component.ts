import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Album } from 'src/app/core/models/album';
import { Track } from 'src/app/core/models/track';

@Component({
    selector: 'app-album-detail',
    templateUrl: './album-detail.component.html',
    styleUrls: ['./album-detail.component.scss'],
    standalone: false
})
export class AlbumDetailComponent {
  @Input() album: Album | null = null;
  @Input() tracks: Track[] = [];
  @Output() sendToPlaylist = new EventEmitter<Track>();
  constructor() {
    console.log('AlbumDetailComponent constructor', this.album);
  }

  sendToPlayList(track: Track) {
    console.log('sendToPlayList', track);
    this.sendToPlaylist.emit(track);
  }
}
