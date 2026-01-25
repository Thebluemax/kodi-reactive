// ==========================================================================
// DOMAIN REPOSITORY - Player (Interface/Contract)
// ==========================================================================

import { Observable } from 'rxjs';
import { PlayerState } from '../entities/player-state.entity';
import { CurrentTrack } from '../entities/current-track.entity';

/**
 * Player Repository Interface
 * Defines the contract for player control and state management
 * Implementations can be Kodi API, Mock, etc.
 */
export abstract class PlayerRepository {
  // ========================================================================
  // Playback Control
  // ========================================================================

  /**
   * Toggle play/pause
   */
  abstract playPause(): Observable<void>;

  /**
   * Stop playback
   */
  abstract stop(): Observable<void>;

  /**
   * Go to next track
   */
  abstract nextTrack(): Observable<void>;

  /**
   * Go to previous track
   */
  abstract previousTrack(): Observable<void>;

  /**
   * Seek to a specific percentage in the track
   * @param percentage - Value between 0 and 100
   */
  abstract seek(percentage: number): Observable<void>;

  // ========================================================================
  // Playback Modes
  // ========================================================================

  /**
   * Toggle shuffle mode
   */
  abstract toggleShuffle(): Observable<void>;

  /**
   * Cycle through repeat modes (off -> one -> all -> off)
   */
  abstract cycleRepeat(): Observable<void>;

  /**
   * Toggle party mode
   */
  abstract togglePartyMode(): Observable<void>;

  // ========================================================================
  // Volume Control
  // ========================================================================

  /**
   * Set volume level
   * @param level - Value between 0 and 100
   */
  abstract setVolume(level: number): Observable<void>;

  /**
   * Toggle mute
   */
  abstract toggleMute(): Observable<void>;
}
