import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Album } from 'src/app/core/models/album';
import { IonicModule } from '@ionic/angular';
import { TileHoverDirective } from '../../directives/tile-hover.directive';
import { AssetsPipe } from '../../core/pipes/assets.pipe';
import { ArrayToStringPipe } from '../../core/pipes/array-to-string.pipe';

@Component({
    selector: 'app-album-square',
    templateUrl: './album-square.component.html',
    styleUrls: ['./album-square.component.scss'],
    imports: [IonicModule, TileHoverDirective, AssetsPipe, ArrayToStringPipe]
})
export class AlbumSquareComponent {
  @Input() album: Album | null = null;
  @Input() ShowFavButtons: boolean = true;
  @Output() sendToPlaylist = new EventEmitter<{
    media: Album | null;
    playMedia: boolean;
  } | null>();
  @Output() sendAlbum = new EventEmitter<Album | null>();
  constructor() {}

  getAlbum(album: Album | null) {
    this.sendAlbum.emit(album);
  }

  emitToPlaylist(album: Album | null, playMedia: boolean) {
    this.sendToPlaylist.emit({ media: album, playMedia: playMedia });
  }
}
