// ==========================================================================
// APPLICATION USE CASE - Update TV Show
// ==========================================================================

import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { TVShowRepository } from '../../domain/repositories/tvshow.repository';
import { TVShowUpdate } from '../../domain/entities/tvshow.entity';

@Injectable({
  providedIn: 'root'
})
export class UpdateTVShowUseCase {
  private readonly tvshowRepository = inject(TVShowRepository);

  /**
   * Update a TV show with a partial patch
   * @param tvshowId - The TV show ID to update
   * @param patch - Only the fields to change
   */
  execute(tvshowId: number, patch: TVShowUpdate): Observable<void> {
    return this.tvshowRepository.updateTVShow(tvshowId, patch);
  }
}
