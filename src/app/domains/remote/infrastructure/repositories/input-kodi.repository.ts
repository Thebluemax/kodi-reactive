// ==========================================================================
// INFRASTRUCTURE - Input Kodi Repository Implementation
// ==========================================================================

import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { InputRepository } from '../../domain/repositories/input.repository';
import { InputAction } from '../../domain/entities/input-action.entity';
import { KodiRpcService } from '@shared/services/kodi-rpc.service';

/** El mando habla con Kodi por su propio sufijo de URL. */
const REMOTE_OPTIONS = { urlSuffix: '?mediaplayer' } as const;

@Injectable({
  providedIn: 'root'
})
export class InputKodiRepository extends InputRepository {
  private readonly rpc = inject(KodiRpcService);

  // ========================================================================
  // Navigation
  // ========================================================================

  navigateUp(): Observable<void> {
    return this.executeInputAction(InputAction.Up);
  }

  navigateDown(): Observable<void> {
    return this.executeInputAction(InputAction.Down);
  }

  navigateLeft(): Observable<void> {
    return this.executeInputAction(InputAction.Left);
  }

  navigateRight(): Observable<void> {
    return this.executeInputAction(InputAction.Right);
  }

  // ========================================================================
  // Actions
  // ========================================================================

  select(): Observable<void> {
    return this.executeInputAction(InputAction.Select);
  }

  back(): Observable<void> {
    return this.executeInputAction(InputAction.Back);
  }

  goHome(): Observable<void> {
    return this.executeInputAction(InputAction.Home);
  }

  contextMenu(): Observable<void> {
    return this.executeInputAction(InputAction.ContextMenu);
  }

  showInfo(): Observable<void> {
    return this.executeInputAction(InputAction.Info);
  }

  // ========================================================================
  // Private Helpers
  // ========================================================================

  private executeInputAction(action: InputAction): Observable<void> {
    return this.rpc.command(action, undefined, REMOTE_OPTIONS);
  }
}
