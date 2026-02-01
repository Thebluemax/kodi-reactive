// ==========================================================================
// APPLICATION USE CASE - Get Movies by Genre
// ==========================================================================

import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { VideoGenreRepository } from '../../domain/repositories/video-genre.repository';
import { MovieListResult, MovieSearchParams } from '@domains/video/movie';

@Injectable({
  providedIn: 'root'
})
export class GetMoviesByGenreUseCase {
  private readonly videoGenreRepository = inject(VideoGenreRepository);

  execute(genreTitle: string, params: MovieSearchParams): Observable<MovieListResult> {
    return this.videoGenreRepository.getMoviesByGenre(genreTitle, params);
  }
}
