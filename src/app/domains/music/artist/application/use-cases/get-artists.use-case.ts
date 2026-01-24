// ==========================================================================
// APPLICATION USE CASE - Get Artists
// ==========================================================================

import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ArtistRepository } from '../../domain/repositories/artist.repository';
import { ArtistListResult, ArtistSearchParams } from '../../domain/entities/artist.entity';

@Injectable({
  providedIn: 'root'
})
export class GetArtistsUseCase {
  private readonly artistRepository = inject(ArtistRepository);

  execute(params: ArtistSearchParams): Observable<ArtistListResult> {
    return this.artistRepository.getArtists(params);
  }
}
