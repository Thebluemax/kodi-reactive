// ==========================================================================
// DOMAIN REPOSITORY - Actor (Interface/Contract)
// ==========================================================================

import { Observable } from 'rxjs';
import { ActorListResult } from '../entities/actor.entity';
import { Movie } from '@domains/video/movie/domain/entities/movie.entity';

/**
 * Actor Repository Interface
 * Defines the contract for actor data access
 */
export abstract class ActorRepository {
  /**
   * Get all actors extracted from the movie library
   */
  abstract getActors(): Observable<ActorListResult>;

  /**
   * Get movies by a specific actor name
   */
  abstract getMoviesByActor(actorName: string): Observable<Movie[]>;
}
