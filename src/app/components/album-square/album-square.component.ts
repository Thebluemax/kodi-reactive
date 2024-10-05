import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Album } from 'src/app/core/models/album';

@Component({
  selector: 'app-album-square',
  templateUrl: './album-square.component.html',
  styleUrls: ['./album-square.component.scss'],
})
export class AlbumSquareComponent  {

  @Input() album: Album | null = null
  @Output() sendToPlaylist = new EventEmitter<{media: Album | null, playMedia: boolean} | null>();
  @Output() sendAlbum = new EventEmitter< Album | null>();
  constructor() { }

  getAlbum(album: Album | null) {
    this.sendAlbum.emit(album);
  }

  emitToPlaylist(album:Album | null, playMedia: boolean) {
    this.sendToPlaylist.emit({media: album, playMedia: playMedia});
  }

}
