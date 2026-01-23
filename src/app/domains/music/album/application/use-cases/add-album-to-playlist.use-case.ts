// ==========================================================================
// APPLICATION USE CASE - Add Album to Playlist
// ==========================================================================

import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { AlbumRepository } from '../../domain/repositories/album.repository';

@Injectable({
  providedIn: 'root'
})
export class AddAlbumToPlaylistUseCase {
  private readonly albumRepository = inject(AlbumRepository);

  /**
   * Add album to playlist
   * @param albumId - The album ID to add
   * @param playImmediately - If true, starts playing immediately
   */
  execute(albumId: number, playImmediately: boolean = false): Observable<void> {
    return this.albumRepository.addToPlaylist(albumId, playImmediately);
  }
}
