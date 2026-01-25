// ==========================================================================
// DOMAIN REPOSITORY - Playlist (Interface/Contract)
// ==========================================================================

import { Observable } from 'rxjs';
import { PlaylistItem, PlaylistResult } from '../entities/playlist-item.entity';

/**
 * Playlist Repository Interface
 * Defines the contract for playlist data access
 * Implementations can be Kodi API, Mock, etc.
 */
export abstract class PlaylistRepository {
  /**
   * Get current playlist items
   * @param playlistId - Playlist ID (0 = audio, 1 = video)
   */
  abstract getPlaylist(playlistId?: number): Observable<PlaylistResult>;

  /**
   * Clear entire playlist
   * @param playlistId - Playlist ID (0 = audio, 1 = video)
   */
  abstract clearPlaylist(playlistId?: number): Observable<void>;

  /**
   * Remove item from playlist by position
   * @param position - Position of item to remove
   * @param playlistId - Playlist ID (0 = audio, 1 = video)
   */
  abstract removeItem(position: number, playlistId?: number): Observable<void>;

  /**
   * Swap two items in playlist (for reordering)
   * @param position1 - First position
   * @param position2 - Second position
   * @param playlistId - Playlist ID (0 = audio, 1 = video)
   */
  abstract swapItems(position1: number, position2: number, playlistId?: number): Observable<void>;

  /**
   * Play item at specific position
   * @param position - Position of item to play
   * @param playlistId - Playlist ID (0 = audio, 1 = video)
   */
  abstract playItem(position: number, playlistId?: number): Observable<void>;

  /**
   * Add item to playlist
   * @param songId - Song ID to add
   * @param playlistId - Playlist ID (0 = audio, 1 = video)
   */
  abstract addItem(songId: number, playlistId?: number): Observable<void>;
}
