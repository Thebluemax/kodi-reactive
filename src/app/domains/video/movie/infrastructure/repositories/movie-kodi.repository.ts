// ==========================================================================
// INFRASTRUCTURE - Movie Kodi Repository Implementation
// ==========================================================================

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { MovieRepository } from '../../domain/repositories/movie.repository';
import {
  Movie,
  MovieListResult,
  MovieSearchParams,
  MovieFactory,
  KodiMovieResponse
} from '../../domain/entities/movie.entity';
import { environment } from 'src/environments/environment';

// TODO: Move to core/infrastructure/config
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

interface KodiMovieDetailResponse {
  result: {
    moviedetails: KodiMovieResponse;
  };
}

const MOVIE_PROPERTIES = [
  'title', 'genre', 'year', 'rating', 'runtime', 'plot',
  'director', 'cast', 'thumbnail', 'fanart', 'playcount',
  'dateadded', 'file', 'tagline', 'studio', 'country'
];

@Injectable({
  providedIn: 'root'
})
export class MovieKodiRepository extends MovieRepository {
  private readonly http = inject(HttpClient);
  private requestId = 1;

  getMovies(params: MovieSearchParams): Observable<MovieListResult> {
    const request = this.buildMoviesRequest(params);

    return this.http.post<KodiMoviesResponse>(KODI_API_URL, request).pipe(
      map(response => ({
        movies: MovieFactory.fromKodiResponseList(response.result.movies || []),
        total: response.result.limits.total,
        start: response.result.limits.start,
        end: response.result.limits.end
      }))
    );
  }

  getMovieById(movieId: number): Observable<Movie> {
    const request: KodiJsonRpcRequest = {
      jsonrpc: environment.jsonrpcVersion,
      method: 'VideoLibrary.GetMovieDetails',
      params: {
        movieid: movieId,
        properties: MOVIE_PROPERTIES
      },
      id: this.getNextId()
    };

    return this.http.post<KodiMovieDetailResponse>(KODI_API_URL, request).pipe(
      map(response => {
        if ((response as any).error) {
          throw new Error((response as any).error.message || 'Unknown Kodi error');
        }
        return MovieFactory.fromKodiResponse(response.result.moviedetails);
      })
    );
  }

  addToPlaylist(movieId: number, playImmediately: boolean): Observable<void> {
    const request: KodiJsonRpcRequest = {
      jsonrpc: environment.jsonrpcVersion,
      method: playImmediately ? 'Player.Open' : 'Playlist.Add',
      params: playImmediately
        ? { item: { movieid: movieId } }
        : { playlistid: 1, item: { movieid: movieId } },
      id: this.getNextId()
    };

    return this.http.post<unknown>(KODI_API_URL, request).pipe(
      map(() => void 0)
    );
  }

  private buildMoviesRequest(params: MovieSearchParams): KodiJsonRpcRequest {
    const request: KodiJsonRpcRequest = {
      jsonrpc: environment.jsonrpcVersion,
      method: 'VideoLibrary.GetMovies',
      params: {
        limits: {
          start: params.start,
          end: params.end
        },
        properties: MOVIE_PROPERTIES,
        sort: { order: 'ascending', method: 'title' }
      },
      id: this.getNextId()
    };

    if (params.searchTerm) {
      (request.params as Record<string, unknown>)['filter'] = {
        field: params.field || 'title',
        operator: params.operator || 'contains',
        value: params.searchTerm
      };
    }

    return request;
  }

  private getNextId(): number {
    return this.requestId++;
  }
}
