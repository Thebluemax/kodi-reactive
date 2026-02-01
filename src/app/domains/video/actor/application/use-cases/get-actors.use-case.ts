// ==========================================================================
// APPLICATION USE CASE - Get Actors
// ==========================================================================

import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ActorRepository } from '../../domain/repositories/actor.repository';
import { ActorListResult } from '../../domain/entities/actor.entity';

@Injectable({
  providedIn: 'root'
})
export class GetActorsUseCase {
  private readonly actorRepository = inject(ActorRepository);

  execute(): Observable<ActorListResult> {
    return this.actorRepository.getActors();
  }
}
