import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Album } from 'src/app/core/models/album';

@Component({
  selector: 'app-album-detail',
  templateUrl: './album-detail.component.html',
  styleUrls: ['./album-detail.component.scss'],
})
export class AlbumDetailComponent {
  @Input() album: Album | null = null;
  @Input() tracks: any[] = [];
  @Output() closeDetail = new EventEmitter<void>();
  @Output() sendToPlaylist = new EventEmitter<number>();
  constructor() { }
  deleteSelected() {
    this.closeDetail.emit();
  }

  sendToPlayList(track: any) {
    console.log('sendToPlayList', track);
    this.sendToPlaylist.emit(track.songid
    );
  }

}
