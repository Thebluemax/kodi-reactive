// ==========================================================================
// APPLICATION USE CASE - Play/Pause
// ==========================================================================

import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { PlayerRepository } from '../../domain/repositories/player.repository';

@Injectable({
  providedIn: 'root'
})
export class PlayPauseUseCase {
  private readonly playerRepository = inject(PlayerRepository);

  execute(): Observable<void> {
    return this.playerRepository.playPause();
  }
}
