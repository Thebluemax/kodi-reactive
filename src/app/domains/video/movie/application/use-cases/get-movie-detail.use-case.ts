// ==========================================================================
// APPLICATION USE CASE - Get Movie Detail
// ==========================================================================

import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { MovieRepository } from '../../domain/repositories/movie.repository';
import { Movie } from '../../domain/entities/movie.entity';

@Injectable({
  providedIn: 'root'
})
export class GetMovieDetailUseCase {
  private readonly movieRepository = inject(MovieRepository);

  execute(movieId: number): Observable<Movie> {
    return this.movieRepository.getMovieById(movieId);
  }
}
