// ==========================================================================
// APPLICATION USE CASE - Get Movies
// ==========================================================================

import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { MovieRepository } from '../../domain/repositories/movie.repository';
import { MovieListResult, MovieSearchParams } from '../../domain/entities/movie.entity';

@Injectable({
  providedIn: 'root'
})
export class GetMoviesUseCase {
  private readonly movieRepository = inject(MovieRepository);

  execute(params: MovieSearchParams): Observable<MovieListResult> {
    return this.movieRepository.getMovies(params);
  }
}
