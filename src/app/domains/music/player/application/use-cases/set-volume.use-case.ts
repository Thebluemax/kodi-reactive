// ==========================================================================
// APPLICATION USE CASE - Set Volume
// ==========================================================================

import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { PlayerRepository } from '../../domain/repositories/player.repository';

@Injectable({
  providedIn: 'root'
})
export class SetVolumeUseCase {
  private readonly playerRepository = inject(PlayerRepository);

  /**
   * Set volume level
   * @param level - Value between 0 and 100
   */
  execute(level: number): Observable<void> {
    const clampedLevel = Math.max(0, Math.min(100, Math.round(level)));
    return this.playerRepository.setVolume(clampedLevel);
  }
}
