// ==========================================================================
// APPLICATION USE CASE - Add Artist to Playlist
// ==========================================================================

import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ArtistRepository } from '../../domain/repositories/artist.repository';

@Injectable({
  providedIn: 'root'
})
export class AddArtistToPlaylistUseCase {
  private readonly artistRepository = inject(ArtistRepository);

  /**
   * Add artist to playlist
   * @param artistId - The artist ID to add
   * @param playImmediately - If true, starts playing immediately
   */
  execute(artistId: number, playImmediately: boolean = false): Observable<void> {
    return this.artistRepository.addToPlaylist(artistId, playImmediately);
  }
}
