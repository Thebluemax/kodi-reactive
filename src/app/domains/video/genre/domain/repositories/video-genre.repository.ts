// ==========================================================================
// DOMAIN REPOSITORY - VideoGenre (Interface/Contract)
// ==========================================================================

import { Observable } from 'rxjs';
import { VideoGenreListResult } from '../entities/video-genre.entity';
import { MovieListResult, MovieSearchParams } from '@domains/video/movie';

/**
 * VideoGenre Repository Interface
 * Defines the contract for video genre data access
 * Implementations can be Kodi API, Mock, LocalStorage, etc.
 */
export abstract class VideoGenreRepository {
  /**
   * Get all video genres
   */
  abstract getGenres(): Observable<VideoGenreListResult>;

  /**
   * Get movies filtered by genre title
   */
  abstract getMoviesByGenre(genreTitle: string, params: MovieSearchParams): Observable<MovieListResult>;
}
