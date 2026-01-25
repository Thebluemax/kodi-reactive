// ==========================================================================
// APPLICATION USE CASE - Remove Playlist Item
// ==========================================================================

import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { PlaylistRepository } from '../../domain/repositories/playlist.repository';

@Injectable({
  providedIn: 'root'
})
export class RemovePlaylistItemUseCase {
  private readonly playlistRepository = inject(PlaylistRepository);

  /**
   * Remove item from playlist by position
   * @param position - Position of item to remove
   * @param playlistId - Playlist ID (0 = audio, 1 = video)
   */
  execute(position: number, playlistId: number = 0): Observable<void> {
    return this.playlistRepository.removeItem(position, playlistId);
  }
}
