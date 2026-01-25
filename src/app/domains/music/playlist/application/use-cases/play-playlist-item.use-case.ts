// ==========================================================================
// APPLICATION USE CASE - Play Playlist Item
// ==========================================================================

import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { PlaylistRepository } from '../../domain/repositories/playlist.repository';

@Injectable({
  providedIn: 'root'
})
export class PlayPlaylistItemUseCase {
  private readonly playlistRepository = inject(PlaylistRepository);

  /**
   * Play item at specific position in playlist
   * @param position - Position of item to play
   * @param playlistId - Playlist ID (0 = audio, 1 = video)
   */
  execute(position: number, playlistId: number = 0): Observable<void> {
    return this.playlistRepository.playItem(position, playlistId);
  }
}
