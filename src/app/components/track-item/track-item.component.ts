import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Track } from 'src/app/core/models/track';

@Component({
    selector: 'app-track-item',
    templateUrl: './track-item.component.html',
    styleUrls: ['./track-item.component.scss'],
    standalone: false
})
export class TrackItemComponent implements OnInit {
  @Input() track: Track | null = null;
  @Output() sendToPlaylist = new EventEmitter<Track>();
  constructor() {}
  ngOnInit(): void {
    console.log('track-item ngOnInit', this.track);
  }

  sendToPlayList(track: Track | null) {
    if (!track) {
      return;
    }
    this.sendToPlaylist.emit(track);
  }
}
