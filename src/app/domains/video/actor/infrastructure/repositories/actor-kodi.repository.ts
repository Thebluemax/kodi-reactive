// ==========================================================================
// INFRASTRUCTURE - Actor Kodi Repository Implementation
// ==========================================================================

import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { ActorRepository } from '../../domain/repositories/actor.repository';
import { ActorListResult, ActorFactory } from '../../domain/entities/actor.entity';
import {
  Movie,
  MovieFactory,
  KodiMovieResponse
} from '@domains/video/movie/domain/entities/movie.entity';
import { KodiRpcService } from '@shared/services/kodi-rpc.service';

interface KodiMoviesResponse {
  result: {
    movies: KodiMovieResponse[];
    limits: {
      start: number;
      end: number;
      total: number;
    };
  };
}

const MOVIE_PROPERTIES_FOR_ACTORS = [
  'title', 'cast'
];

const MOVIE_PROPERTIES_FULL = [
  'title', 'genre', 'year', 'rating', 'runtime', 'plot',
  'director', 'cast', 'thumbnail', 'fanart', 'playcount',
  'dateadded', 'file', 'tagline', 'studio', 'country'
];

@Injectable({
  providedIn: 'root'
})
export class ActorKodiRepository extends ActorRepository {
  private readonly rpc = inject(KodiRpcService);

  getActors(): Observable<ActorListResult> {
    return this.rpc.query<KodiMoviesResponse['result']>('VideoLibrary.GetMovies', {
      properties: MOVIE_PROPERTIES_FOR_ACTORS,
      sort: { order: 'ascending', method: 'title' }
    }).pipe(
      map(result => {
        const movies = MovieFactory.fromKodiResponseList(
          result.movies || []
        );
        const actors = ActorFactory.fromMovieCastData(movies);
        return {
          actors,
          total: actors.length
        };
      })
    );
  }

  getMoviesByActor(actorName: string): Observable<Movie[]> {
    return this.rpc.query<KodiMoviesResponse['result']>('VideoLibrary.GetMovies', {
      properties: MOVIE_PROPERTIES_FULL,
      filter: {
        field: 'actor',
        operator: 'is',
        value: actorName
      },
      sort: { order: 'ascending', method: 'title' }
    }).pipe(
      map(result =>
        MovieFactory.fromKodiResponseList(result.movies || [])
      )
    );
  }
}
