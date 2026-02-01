// ==========================================================================
// APPLICATION USE CASE - Get Seasons
// ==========================================================================

import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { TVShowRepository } from '../../domain/repositories/tvshow.repository';
import { Season } from '../../domain/entities/tvshow.entity';

@Injectable({
  providedIn: 'root'
})
export class GetSeasonsUseCase {
  private readonly tvshowRepository = inject(TVShowRepository);

  execute(tvshowId: number): Observable<Season[]> {
    return this.tvshowRepository.getSeasons(tvshowId);
  }
}
