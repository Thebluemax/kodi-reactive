// ==========================================================================
// APPLICATION USE CASE - Next Track
// ==========================================================================

import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { PlayerRepository } from '../../domain/repositories/player.repository';

@Injectable({
  providedIn: 'root'
})
export class NextTrackUseCase {
  private readonly playerRepository = inject(PlayerRepository);

  execute(): Observable<void> {
    return this.playerRepository.nextTrack();
  }
}
