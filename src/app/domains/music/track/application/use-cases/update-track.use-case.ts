// ==========================================================================
// APPLICATION USE CASE - Update Track
// ==========================================================================

import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { TrackRepository } from '../../domain/repositories/track.repository';
import { TrackUpdate } from '../../domain/entities/track.entity';

@Injectable({
  providedIn: 'root'
})
export class UpdateTrackUseCase {
  private readonly trackRepository = inject(TrackRepository);

  /**
   * Update a song with a partial patch
   * @param songId - The song ID to update
   * @param patch - Only the fields to change
   */
  execute(songId: number, patch: TrackUpdate): Observable<void> {
    return this.trackRepository.updateSong(songId, patch);
  }
}
