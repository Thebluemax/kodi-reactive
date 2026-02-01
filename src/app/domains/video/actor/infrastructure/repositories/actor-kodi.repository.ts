// ==========================================================================
// INFRASTRUCTURE - Actor Kodi Repository Implementation
// ==========================================================================

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { ActorRepository } from '../../domain/repositories/actor.repository';
import { ActorListResult, ActorFactory } from '../../domain/entities/actor.entity';
import {
  Movie,
  MovieFactory,
  KodiMovieResponse
} from '@domains/video/movie/domain/entities/movie.entity';
import { environment } from 'src/environments/environment';

const KODI_API_URL = `${environment.serverApiUrl}:${environment.apiPort}/jsonrpc`;

interface KodiJsonRpcRequest {
  jsonrpc: string;
  method: string;
  params?: Record<string, unknown>;
  id: number;
}

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
  private readonly http = inject(HttpClient);
  private requestId = 1;

  getActors(): Observable<ActorListResult> {
    const request: KodiJsonRpcRequest = {
      jsonrpc: environment.jsonrpcVersion,
      method: 'VideoLibrary.GetMovies',
      params: {
        properties: MOVIE_PROPERTIES_FOR_ACTORS,
        sort: { order: 'ascending', method: 'title' }
      },
      id: this.getNextId()
    };

    return this.http.post<KodiMoviesResponse>(KODI_API_URL, request).pipe(
      map(response => {
        const movies = MovieFactory.fromKodiResponseList(response.result.movies || []);
        const actors = ActorFactory.fromMovieCastData(movies);
        return {
          actors,
          total: actors.length
        };
      })
    );
  }

  getMoviesByActor(actorName: string): Observable<Movie[]> {
    const request: KodiJsonRpcRequest = {
      jsonrpc: environment.jsonrpcVersion,
      method: 'VideoLibrary.GetMovies',
      params: {
        properties: MOVIE_PROPERTIES_FULL,
        filter: {
          field: 'actor',
          operator: 'is',
          value: actorName
        },
        sort: { order: 'ascending', method: 'title' }
      },
      id: this.getNextId()
    };

    return this.http.post<KodiMoviesResponse>(KODI_API_URL, request).pipe(
      map(response => MovieFactory.fromKodiResponseList(response.result.movies || []))
    );
  }

  private getNextId(): number {
    return this.requestId++;
  }
}
