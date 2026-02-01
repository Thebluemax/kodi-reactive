// ==========================================================================
// APPLICATION USE CASE - Get Movies by Actor
// ==========================================================================

import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ActorRepository } from '../../domain/repositories/actor.repository';
import { Movie } from '@domains/video/movie/domain/entities/movie.entity';

@Injectable({
  providedIn: 'root'
})
export class GetMoviesByActorUseCase {
  private readonly actorRepository = inject(ActorRepository);

  execute(actorName: string): Observable<Movie[]> {
    return this.actorRepository.getMoviesByActor(actorName);
  }
}
