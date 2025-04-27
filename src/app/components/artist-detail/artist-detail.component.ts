import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Album } from 'src/app/core/models/album';
import { Artist } from 'src/app/core/models/artist';
import { Track } from 'src/app/core/models/track';

@Component({
  selector: 'app-artist-detail',
  templateUrl: './artist-detail.component.html',
  styleUrls: ['./artist-detail.component.scss'],
})
export class ArtistDetailComponent {
  @Input() isModalOpen: boolean = true;
  @Input() artist: Artist | null = null;
  @Input() albums: any[] = [];
  @Output() closeDetail = new EventEmitter<void>();
  @Output() sendToPlaylist = new EventEmitter<Track>();
  constructor(private modalCtrl: ModalController) {}
  sendToPlayList(track: Track) {
    console.log('sendToPlayList', track);
    this.sendToPlaylist.emit(track);
  }

  onWillDismiss(event: any) {
    this.closeDetail.emit();
  }

  cancel() {
    this.closeDetail.emit();
  }
}
