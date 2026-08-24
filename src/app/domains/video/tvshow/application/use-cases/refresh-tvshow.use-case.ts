// ==========================================================================
// APPLICATION USE CASE - Refresh TV Show
// ==========================================================================

import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { TVShowRepository } from '../../domain/repositories/tvshow.repository';
import { MediaRefreshOptions } from '@shared/types/media-refresh.type';

@Injectable({
  providedIn: 'root'
})
export class RefreshTVShowUseCase {
  private readonly tvshowRepository = inject(TVShowRepository);

  /**
   * Ask Kodi to scrape the TV show again
   * @param tvshowId - The TV show ID to refresh
   * @param options - Title, NFO handling and whether to cascade to episodes
   */
  execute(tvshowId: number, options: MediaRefreshOptions = {}): Observable<void> {
    return this.tvshowRepository.refreshTVShow(tvshowId, options);
  }
}
