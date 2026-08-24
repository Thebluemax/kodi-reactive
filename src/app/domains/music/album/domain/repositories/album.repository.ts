// ==========================================================================
// DOMAIN REPOSITORY - Album (Interface/Contract)
// ==========================================================================

import { Observable } from 'rxjs';
import { Album, AlbumListResult, AlbumSearchParams, AlbumUpdate } from '../entities/album.entity';
import { Track } from '@domains/music/track/domain/entities/track.entity';

/**
 * Album Repository Interface
 * Defines the contract for album data access
 * Implementations can be Kodi API, Mock, LocalStorage, etc.
 */
export abstract class AlbumRepository {
  /**
   * Get paginated list of albums
   */
  abstract getAlbums(params: AlbumSearchParams): Observable<AlbumListResult>;

  /**
   * Get single album by ID with full details
   */
  abstract getAlbumById(albumId: number): Observable<Album>;

  /**
   * Get tracks for a specific album
   */
  abstract getAlbumTracks(albumId: number): Observable<Track[]>;

  /**
   * Add album to playlist
   * @param albumId - Album ID
   * @param playImmediately - If true, starts playing immediately
   */
  abstract addToPlaylist(albumId: number, playImmediately: boolean): Observable<void>;

  /**
   * Update an album with a partial patch
   * @param albumId - Album ID
   * @param patch - Only the fields to change; anything absent is left untouched
   */
  abstract updateAlbum(albumId: number, patch: AlbumUpdate): Observable<void>;
}
