// ==========================================================================
// APPLICATION USE CASE - Add Movie to Playlist
// ==========================================================================

import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { MovieRepository } from '../../domain/repositories/movie.repository';

@Injectable({
  providedIn: 'root'
})
export class AddMovieToPlaylistUseCase {
  private readonly movieRepository = inject(MovieRepository);

  /**
   * Add movie to playlist
   * @param movieId - The movie ID to add
   * @param playImmediately - If true, starts playing immediately
   */
  execute(movieId: number, playImmediately: boolean = false): Observable<void> {
    return this.movieRepository.addToPlaylist(movieId, playImmediately);
  }
}
