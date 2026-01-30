// ==========================================================================
// PRESENTATION - Current Track Component
// ==========================================================================

import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { CurrentTrack } from '../../../domain/entities/current-track.entity';
import { AssetsPipe } from '@shared/pipes/assets.pipe';
import { ArrayToStringPipe } from '@shared/pipes/array-to-string.pipe';

@Component({
  selector: 'player-current-track',
  standalone: true,
  imports: [AssetsPipe, ArrayToStringPipe],
  templateUrl: './current-track.component.html',
  styleUrl: './current-track.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CurrentTrackComponent {
  // Input using signal
  readonly currentTrack = input<CurrentTrack | null>(null);
}
