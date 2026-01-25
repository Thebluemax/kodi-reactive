// ==========================================================================
// APPLICATION USE CASE - Previous Track
// ==========================================================================

import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { PlayerRepository } from '../../domain/repositories/player.repository';

@Injectable({
  providedIn: 'root'
})
export class PreviousTrackUseCase {
  private readonly playerRepository = inject(PlayerRepository);

  execute(): Observable<void> {
    return this.playerRepository.previousTrack();
  }
}
