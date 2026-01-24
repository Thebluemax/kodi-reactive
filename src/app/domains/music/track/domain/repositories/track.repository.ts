// ==========================================================================
// DOMAIN REPOSITORY - Track (Interface/Contract)
// ==========================================================================

import { Observable } from 'rxjs';
import { Track } from '../entities/track.entity';

/**
 * Track Repository Interface
 * Defines the contract for track data access
 * Implementations can be Kodi API, Mock, LocalStorage, etc.
 */
export abstract class TrackRepository {
  /**
   * Add track to playlist
   * @param trackId - Track ID (songId)
   * @param playImmediately - If true, starts playing immediately
   */
  abstract addToPlaylist(trackId: number, playImmediately: boolean): Observable<void>;

  /**
   * Play track immediately
   * @param trackId - Track ID (songId)
   */
  abstract playTrack(trackId: number): Observable<void>;
}