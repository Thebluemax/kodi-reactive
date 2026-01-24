// ==========================================================================
// APPLICATION USE CASE - Add Track to Playlist
// ==========================================================================

import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ArtistRepository } from '../../domain/repositories/artist.repository';

@Injectable({
  providedIn: 'root'
})
export class AddTrackToPlaylistUseCase {
  private readonly artistRepository = inject(ArtistRepository);

  execute(songId: number): Observable<void> {
    return this.artistRepository.addTrackToPlaylist(songId);
  }
}
