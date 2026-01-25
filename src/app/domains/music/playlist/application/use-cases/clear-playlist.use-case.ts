// ==========================================================================
// APPLICATION USE CASE - Clear Playlist
// ==========================================================================

import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { PlaylistRepository } from '../../domain/repositories/playlist.repository';

@Injectable({
  providedIn: 'root'
})
export class ClearPlaylistUseCase {
  private readonly playlistRepository = inject(PlaylistRepository);

  /**
   * Clear entire playlist
   * @param playlistId - Playlist ID (0 = audio, 1 = video)
   */
  execute(playlistId: number = 0): Observable<void> {
    return this.playlistRepository.clearPlaylist(playlistId);
  }
}
