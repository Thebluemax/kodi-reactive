// ==========================================================================
// APPLICATION USE CASE - Play Track
// ==========================================================================

import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { TrackRepository } from '../../domain/repositories/track.repository';

@Injectable({
  providedIn: 'root'
})
export class PlayTrackUseCase {
  private readonly trackRepository = inject(TrackRepository);

  /**
   * Play track immediately
   * @param trackId - The track ID to play
   */
  execute(trackId: number): Observable<void> {
    return this.trackRepository.playTrack(trackId);
  }
}