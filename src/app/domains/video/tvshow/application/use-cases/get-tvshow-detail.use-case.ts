// ==========================================================================
// APPLICATION USE CASE - Get TVShow Detail
// ==========================================================================

import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { TVShowRepository } from '../../domain/repositories/tvshow.repository';
import { TVShow } from '../../domain/entities/tvshow.entity';

@Injectable({
  providedIn: 'root'
})
export class GetTVShowDetailUseCase {
  private readonly tvshowRepository = inject(TVShowRepository);

  execute(tvshowId: number): Observable<TVShow> {
    return this.tvshowRepository.getTVShowById(tvshowId);
  }
}
