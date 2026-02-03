// ==========================================================================
// APPLICATION USE CASE - Add Episode to Playlist
// ==========================================================================

import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { TVShowRepository } from '../../domain/repositories/tvshow.repository';

@Injectable({
  providedIn: 'root'
})
export class AddEpisodeToPlaylistUseCase {
  private readonly tvshowRepository = inject(TVShowRepository);

  /**
   * Add episode to playlist
   * @param episodeId - The episode ID to add
   * @param playImmediately - If true, starts playing immediately
   */
  execute(episodeId: number, playImmediately: boolean = false): Observable<void> {
    return this.tvshowRepository.addEpisodeToPlaylist(episodeId, playImmediately);
  }
}
