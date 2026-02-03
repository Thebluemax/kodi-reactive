// ==========================================================================
// APPLICATION USE CASE - Get TVShows
// ==========================================================================

import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { TVShowRepository } from '../../domain/repositories/tvshow.repository';
import { TVShowListResult, TVShowSearchParams } from '../../domain/entities/tvshow.entity';

@Injectable({
  providedIn: 'root'
})
export class GetTVShowsUseCase {
  private readonly tvshowRepository = inject(TVShowRepository);

  execute(params: TVShowSearchParams): Observable<TVShowListResult> {
    return this.tvshowRepository.getTVShows(params);
  }
}
