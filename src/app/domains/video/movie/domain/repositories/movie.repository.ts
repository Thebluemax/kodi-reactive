// ==========================================================================
// DOMAIN REPOSITORY - Movie (Interface/Contract)
// ==========================================================================

import { Observable } from 'rxjs';
import { Movie, MovieListResult, MovieSearchParams, MovieUpdate } from '../entities/movie.entity';

/**
 * Movie Repository Interface
 * Defines the contract for movie data access
 * Implementations can be Kodi API, Mock, LocalStorage, etc.
 */
export abstract class MovieRepository {
  /**
   * Get paginated list of movies
   */
  abstract getMovies(params: MovieSearchParams): Observable<MovieListResult>;

  /**
   * Get single movie by ID with full details
   */
  abstract getMovieById(movieId: number): Observable<Movie>;

  /**
   * Add movie to playlist
   * @param movieId - Movie ID
   * @param playImmediately - If true, starts playing immediately
   */
  abstract addToPlaylist(movieId: number, playImmediately: boolean): Observable<void>;

  /**
   * Update a movie with a partial patch
   * @param movieId - Movie ID
   * @param patch - Only the fields to change; anything absent is left untouched
   */
  abstract updateMovie(movieId: number, patch: MovieUpdate): Observable<void>;
}
