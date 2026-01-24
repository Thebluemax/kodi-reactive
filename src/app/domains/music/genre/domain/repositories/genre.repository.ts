// ==========================================================================
// DOMAIN REPOSITORY - Genre (Interface/Contract)
// ==========================================================================

import { Observable } from 'rxjs';
import { Genre, GenreListResult } from '../entities/genre.entity';
import { Album } from '@domains/music/album/domain/entities/album.entity';
import { Artist } from '@domains/music/artist/domain/entities/artist.entity';

/**
 * Genre Repository Interface
 * Defines the contract for genre data access
 * Implementations can be Kodi API, Mock, LocalStorage, etc.
 */
export abstract class GenreRepository {
  /**
   * Get list of all genres
   */
  abstract getGenres(): Observable<GenreListResult>;

  /**
   * Get albums filtered by genre
   * @param genreId - Genre ID
   * @param genreTitle - Genre title for filter
   */
  abstract getGenreAlbums(genreId: number, genreTitle: string): Observable<Album[]>;

  /**
   * Get artists filtered by genre
   * @param genreId - Genre ID
   * @param genreLabel - Genre label for filter
   */
  abstract getGenreArtists(genreId: number, genreLabel: string): Observable<Artist[]>;
}
