// ==========================================================================
// APPLICATION USE CASE - Get Episodes
// ==========================================================================

import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { TVShowRepository } from '../../domain/repositories/tvshow.repository';
import { Episode } from '../../domain/entities/tvshow.entity';

@Injectable({
  providedIn: 'root'
})
export class GetEpisodesUseCase {
  private readonly tvshowRepository = inject(TVShowRepository);

  execute(tvshowId: number, season: number): Observable<Episode[]> {
    return this.tvshowRepository.getEpisodes(tvshowId, season);
  }
}
