// ==========================================================================
// DOMAIN REPOSITORY - Artist (Interface/Contract)
// ==========================================================================

import { Observable } from 'rxjs';
import { Artist, ArtistListResult, ArtistSearchParams, ArtistAlbumGroup } from '../entities/artist.entity';

/**
 * Artist Repository Interface
 * Defines the contract for artist data access
 * Implementations can be Kodi API, Mock, LocalStorage, etc.
 */
export abstract class ArtistRepository {
  /**
   * Get paginated list of artists
   */
  abstract getArtists(params: ArtistSearchParams): Observable<ArtistListResult>;

  /**
   * Get single artist by ID with full details
   */
  abstract getArtistById(artistId: number): Observable<Artist>;

  /**
   * Get albums with tracks for a specific artist
   */
  abstract getArtistAlbums(artistId: number): Observable<ArtistAlbumGroup[]>;

  /**
   * Add artist to playlist
   * @param artistId - Artist ID
   * @param playImmediately - If true, starts playing immediately
   */
  abstract addToPlaylist(artistId: number, playImmediately: boolean): Observable<void>;
}
