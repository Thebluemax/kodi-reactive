// ==========================================================================
// APPLICATION USE CASE - Set Repeat
// ==========================================================================

import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { PlayerRepository } from '../../domain/repositories/player.repository';

@Injectable({
  providedIn: 'root'
})
export class SetRepeatUseCase {
  private readonly playerRepository = inject(PlayerRepository);

  execute(): Observable<void> {
    return this.playerRepository.cycleRepeat();
  }
}
