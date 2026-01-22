import { Component, Input, OnInit } from '@angular/core';
import { CurrentTrack } from 'src/app/core/models/app-info';

@Component({
    selector: 'player-current-track',
    templateUrl: './current-track.component.html',
    styleUrls: ['./current-track.component.scss'],
    standalone: false
})
export class CurrentTrackComponent {
  @Input() currentTrack: CurrentTrack | null = null;
  constructor() {}
}
