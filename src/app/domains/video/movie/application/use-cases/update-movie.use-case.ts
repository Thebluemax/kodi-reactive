// ==========================================================================
// APPLICATION USE CASE - Update Movie
// ==========================================================================

import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { MovieRepository } from '../../domain/repositories/movie.repository';
import { MovieUpdate } from '../../domain/entities/movie.entity';

@Injectable({
  providedIn: 'root'
})
export class UpdateMovieUseCase {
  private readonly movieRepository = inject(MovieRepository);

  /**
   * Update a movie with a partial patch
   * @param movieId - The movie ID to update
   * @param patch - Only the fields to change
   */
  execute(movieId: number, patch: MovieUpdate): Observable<void> {
    return this.movieRepository.updateMovie(movieId, patch);
  }
}
