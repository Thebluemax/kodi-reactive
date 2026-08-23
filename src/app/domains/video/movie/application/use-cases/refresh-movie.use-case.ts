// ==========================================================================
// APPLICATION USE CASE - Refresh Movie
// ==========================================================================

import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { MovieRepository } from '../../domain/repositories/movie.repository';
import { MediaRefreshOptions } from '@shared/types/media-refresh.type';

@Injectable({
  providedIn: 'root'
})
export class RefreshMovieUseCase {
  private readonly movieRepository = inject(MovieRepository);

  /**
   * Ask Kodi to scrape the movie again
   * @param movieId - The movie ID to refresh
   * @param options - Title to search with, and whether to ignore a local NFO
   */
  execute(movieId: number, options: MediaRefreshOptions = {}): Observable<void> {
    return this.movieRepository.refreshMovie(movieId, options);
  }
}
