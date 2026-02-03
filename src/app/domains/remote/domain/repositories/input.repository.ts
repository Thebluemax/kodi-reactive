// ==========================================================================
// DOMAIN REPOSITORY - Input (Interface/Contract)
// ==========================================================================

import { Observable } from 'rxjs';

/**
 * Input Repository Interface
 * Defines the contract for remote control input actions
 * Implementations can be Kodi API, Mock, etc.
 */
export abstract class InputRepository {
  // ========================================================================
  // Navigation
  // ========================================================================

  /**
   * Navigate up in the Kodi UI
   */
  abstract navigateUp(): Observable<void>;

  /**
   * Navigate down in the Kodi UI
   */
  abstract navigateDown(): Observable<void>;

  /**
   * Navigate left in the Kodi UI
   */
  abstract navigateLeft(): Observable<void>;

  /**
   * Navigate right in the Kodi UI
   */
  abstract navigateRight(): Observable<void>;

  // ========================================================================
  // Actions
  // ========================================================================

  /**
   * Select/confirm current item
   */
  abstract select(): Observable<void>;

  /**
   * Go back to previous screen
   */
  abstract back(): Observable<void>;

  /**
   * Go to Kodi home screen
   */
  abstract goHome(): Observable<void>;

  /**
   * Open context menu for current item
   */
  abstract contextMenu(): Observable<void>;

  /**
   * Show info dialog for current item
   */
  abstract showInfo(): Observable<void>;
}
