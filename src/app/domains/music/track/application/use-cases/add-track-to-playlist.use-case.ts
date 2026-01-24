// ==========================================================================
// APPLICATION USE CASE - Add Track to Playlist
// ==========================================================================

import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { TrackRepository } from '../../domain/repositories/track.repository';

@Injectable({
  providedIn: 'root'
})
export class AddTrackToPlaylistUseCase {
  private readonly trackRepository = inject(TrackRepository);

  /**
   * Add track to playlist
   * @param trackId - The track ID to add
   * @param playImmediately - If true, starts playing immediately
   */
  execute(trackId: number, playImmediately: boolean = false): Observable<void> {
    return this.trackRepository.addToPlaylist(trackId, playImmediately);
  }
}