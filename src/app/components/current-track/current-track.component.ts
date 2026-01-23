import { Component, Input, OnInit } from '@angular/core';
import { CurrentTrack } from 'src/app/core/models/app-info';
import { AssetsPipe } from '../../core/pipes/assets.pipe';
import { ArrayToStringPipe } from '../../core/pipes/array-to-string.pipe';

@Component({
    selector: 'player-current-track',
    templateUrl: './current-track.component.html',
    styleUrls: ['./current-track.component.scss'],
    imports: [AssetsPipe, ArrayToStringPipe]
})
export class CurrentTrackComponent {
  @Input() currentTrack: CurrentTrack | null = null;
  constructor() {}
}
