// ==========================================================================
// APPLICATION USE CASE - Get Playlist
// ==========================================================================

import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { PlaylistRepository } from '../../domain/repositories/playlist.repository';
import { PlaylistResult } from '../../domain/entities/playlist-item.entity';

@Injectable({
  providedIn: 'root'
})
export class GetPlaylistUseCase {
  private readonly playlistRepository = inject(PlaylistRepository);

  /**
   * Get current playlist items
   * @param playlistId - Playlist ID (0 = audio, 1 = video)
   */
  execute(playlistId: number = 0): Observable<PlaylistResult> {
    return this.playlistRepository.getPlaylist(playlistId);
  }
}
