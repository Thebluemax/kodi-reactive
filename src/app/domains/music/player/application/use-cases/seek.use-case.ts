// ==========================================================================
// APPLICATION USE CASE - Seek
// ==========================================================================

import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { PlayerRepository } from '../../domain/repositories/player.repository';

@Injectable({
  providedIn: 'root'
})
export class SeekUseCase {
  private readonly playerRepository = inject(PlayerRepository);

  /**
   * Seek to a specific percentage in the track
   * @param percentage - Value between 0 and 100
   */
  execute(percentage: number): Observable<void> {
    const clampedPercentage = Math.max(0, Math.min(100, percentage));
    return this.playerRepository.seek(clampedPercentage);
  }
}
