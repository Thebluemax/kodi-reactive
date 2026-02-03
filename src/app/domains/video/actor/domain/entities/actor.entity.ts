// ==========================================================================
// DOMAIN ENTITY - Actor
// ==========================================================================

import { Movie } from '@domains/video/movie/domain/entities/movie.entity';

/**
 * Actor Entity
 * Represents an actor extracted from movie cast data
 */
export interface Actor {
  readonly name: string;
  readonly thumbnail: string;
  readonly roles: ActorRole[];
}

/**
 * Actor Role
 * Represents a role an actor played in a specific movie
 */
export interface ActorRole {
  readonly movieId: number;
  readonly movieTitle: string;
  readonly role: string;
}

/**
 * Actor List Response
 * Used for actor lists with total count
 */
export interface ActorListResult {
  readonly actors: Actor[];
  readonly total: number;
}

/**
 * Actor Factory
 * Creates Actor entities from raw movie cast data
 */
export class ActorFactory {
  /**
   * Extracts unique actors from an array of movies with cast data.
   * Groups roles per actor and sorts alphabetically by name.
   */
  static fromMovieCastData(movies: Movie[]): Actor[] {
    const actorMap = new Map<string, Actor>();

    for (const movie of movies) {
      for (const cast of movie.cast) {
        const existing = actorMap.get(cast.name);
        const role: ActorRole = {
          movieId: movie.movieId,
          movieTitle: movie.title,
          role: cast.role
        };

        if (existing) {
          actorMap.set(cast.name, {
            ...existing,
            thumbnail: existing.thumbnail || cast.thumbnail || '',
            roles: [...existing.roles, role]
          });
        } else {
          actorMap.set(cast.name, {
            name: cast.name,
            thumbnail: cast.thumbnail || '',
            roles: [role]
          });
        }
      }
    }

    return Array.from(actorMap.values())
      .sort((a, b) => a.name.localeCompare(b.name));
  }
}
