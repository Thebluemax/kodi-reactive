// ==========================================================================
// APPLICATION USE CASE - Get Genre Detail
// ==========================================================================

import { Injectable, inject } from '@angular/core';
import { Observable, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { GenreRepository } from '../../domain/repositories/genre.repository';
import { Genre } from '../../domain/entities/genre.entity';
import { Album } from '@domains/music/album/domain/entities/album.entity';
import { Artist } from '@domains/music/artist/domain/entities/artist.entity';

export interface GenreDetailResult {
  readonly genre: Genre;
  readonly albums: Album[];
  readonly artists: Artist[];
}

@Injectable({
  providedIn: 'root'
})
export class GetGenreDetailUseCase {
  private readonly genreRepository = inject(GenreRepository);

  execute(genre: Genre): Observable<GenreDetailResult> {
    return forkJoin({
      albums: this.genreRepository.getGenreAlbums(genre.genreId, genre.title),
      artists: this.genreRepository.getGenreArtists(genre.genreId, genre.label)
    }).pipe(
      map(({ albums, artists }) => ({
        genre,
        albums,
        artists
      }))
    );
  }
}
