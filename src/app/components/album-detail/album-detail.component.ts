import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Album } from 'src/app/core/models/album';
import { Track } from 'src/app/core/models/track';

@Component({
  selector: 'app-album-detail',
  templateUrl: './album-detail.component.html',
  styleUrls: ['./album-detail.component.scss'],
})
export class AlbumDetailComponent {
  @Input() isModalOpen: boolean = true;
  @Input() album: Album | null = null;
  @Input() tracks: Track[] = [];
  @Output() closeDetail = new EventEmitter<void>();
  @Output() sendToPlaylist = new EventEmitter<Track>();
  constructor() {}
  deleteSelected() {
    this.closeDetail.emit();
  }

  sendToPlayList(track: Track) {
    console.log('sendToPlayList', track);
    this.sendToPlaylist.emit(track);
  }

  onWillDismiss(event: any) {
    console.log('onWillDismiss', event);
    this.closeDetail.emit();
  }

  cancel() {
    console.log('cancel');
    this.closeDetail.emit();
  }
}
