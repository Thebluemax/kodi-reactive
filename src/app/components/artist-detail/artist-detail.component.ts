import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { ModalController, IonicModule } from '@ionic/angular';
import { Album } from 'src/app/core/models/album';
import { Artist } from 'src/app/core/models/artist';
import { Track } from 'src/app/core/models/track';
import { NgFor } from '@angular/common';
import { AssetsPipe } from '../../core/pipes/assets.pipe';
import { ArrayToStringPipe } from '../../core/pipes/array-to-string.pipe';
import { SecondsToStringPipe } from '../../core/pipes/seconds-to-string.pipe';

@Component({
    selector: 'app-artist-detail',
    templateUrl: './artist-detail.component.html',
    styleUrls: ['./artist-detail.component.scss'],
    imports: [IonicModule, NgFor, AssetsPipe, ArrayToStringPipe, SecondsToStringPipe]
})
export class ArtistDetailComponent {
  private modalCtrl = inject(ModalController);

  @Input() isModalOpen: boolean = true;
  @Input() artist: Artist | null = null;
  @Input() albums: any[] = [];
  @Output() closeDetail = new EventEmitter<void>();
  @Output() sendToPlaylist = new EventEmitter<Track>();
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
