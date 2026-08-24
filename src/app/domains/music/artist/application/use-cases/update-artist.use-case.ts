// ==========================================================================
// APPLICATION USE CASE - Update Artist
// ==========================================================================

import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ArtistRepository } from '../../domain/repositories/artist.repository';
import { ArtistUpdate } from '../../domain/entities/artist.entity';

@Injectable({
  providedIn: 'root'
})
export class UpdateArtistUseCase {
  private readonly artistRepository = inject(ArtistRepository);

  /**
   * Update an artist with a partial patch
   * @param artistId - The artist ID to update
   * @param patch - Only the fields to change
   */
  execute(artistId: number, patch: ArtistUpdate): Observable<void> {
    return this.artistRepository.updateArtist(artistId, patch);
  }
}
