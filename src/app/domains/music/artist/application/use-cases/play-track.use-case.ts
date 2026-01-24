// ==========================================================================
// APPLICATION USE CASE - Play Track
// ==========================================================================

import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ArtistRepository } from '../../domain/repositories/artist.repository';

@Injectable({
  providedIn: 'root'
})
export class PlayTrackUseCase {
  private readonly artistRepository = inject(ArtistRepository);

  execute(songId: number): Observable<void> {
    return this.artistRepository.playTrack(songId);
  }
}
