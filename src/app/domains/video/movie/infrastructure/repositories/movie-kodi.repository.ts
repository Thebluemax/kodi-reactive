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
  KodiMovieResponse, MovieUpdate } from '../../domain/entities/movie.entity';
import { environment } from 'src/environments/environment';
import { KodiConfigService } from '@shared/services/kodi-config.service';
import { Methods } from '@shared/enums/methods';

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

/** Kodi devuelve los rechazos con HTTP 200 y el fallo dentro del sobre. */
interface KodiJsonRpcEnvelope {
  result?: unknown;
  error?: {
    code: number;
    message: string;
  };
}

/** Traduccion del vocabulario del dominio al de VideoLibrary.SetMovieDetails. */
const UPDATE_PARAM_NAMES: Record<keyof MovieUpdate, string> = {
  title: 'title',
  originalTitle: 'originaltitle',
  sortTitle: 'sorttitle',
  tagline: 'tagline',
  plot: 'plot',
  plotOutline: 'plotoutline',
  genre: 'genre',
  director: 'director',
  writer: 'writer',
  studio: 'studio',
  country: 'country',
  tag: 'tag',
  showlink: 'showlink',
  year: 'year',
  premiered: 'premiered',
  runtime: 'runtime',
  rating: 'rating',
  userRating: 'userrating',
  votes: 'votes',
  top250: 'top250',
  mpaa: 'mpaa',
  imdbNumber: 'imdbnumber',
  trailer: 'trailer',
  set: 'set',
  art: 'art'
};

/** El detalle alimenta el editor: pide todo lo que SetMovieDetails escribe. */
const MOVIE_DETAIL_PROPERTIES = [
  'title', 'originaltitle', 'sorttitle', 'genre', 'year', 'premiered',
  'rating', 'userrating', 'votes', 'top250', 'runtime', 'plot', 'plotoutline',
  'director', 'writer', 'cast', 'studio', 'country', 'tag', 'showlink',
  'mpaa', 'imdbnumber', 'trailer', 'set', 'tagline',
  'thumbnail', 'fanart', 'art', 'playcount', 'dateadded', 'file'
];

/**
 * La lista pagina y sus tarjetas solo pintan titulo, generos, fanart y año.
 * Al abrir el detalle la pelicula se recarga entera de todas formas.
 */
const MOVIE_LIST_PROPERTIES = [
  'title', 'genre', 'fanart', 'year'
];

@Injectable({
  providedIn: 'root'
})
export class MovieKodiRepository extends MovieRepository {
  private readonly http = inject(HttpClient);
  private readonly config = inject(KodiConfigService);
  private requestId = 1;

  getMovies(params: MovieSearchParams): Observable<MovieListResult> {
    const request = this.buildMoviesRequest(params);

    return this.http.post<KodiMoviesResponse>(this.config.jsonRpcUrl, request).pipe(
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
        properties: MOVIE_DETAIL_PROPERTIES
      },
      id: this.getNextId()
    };

    return this.http.post<KodiMovieDetailResponse>(this.config.jsonRpcUrl, request).pipe(
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

    return this.http.post<unknown>(this.config.jsonRpcUrl, request).pipe(
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
        properties: MOVIE_LIST_PROPERTIES,
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

  updateMovie(movieId: number, patch: MovieUpdate): Observable<void> {
    const request: KodiJsonRpcRequest = {
      jsonrpc: environment.jsonrpcVersion,
      method: Methods.VideoLibrarySetMovieDetails,
      params: {
        movieid: movieId,
        ...this.toKodiParams(patch)
      },
      id: this.getNextId()
    };

    return this.http.post<KodiJsonRpcEnvelope>(this.config.jsonRpcUrl, request).pipe(
      map(response => {
        if (response.error) {
          throw new Error(
            `Kodi rechazo la actualizacion: ${response.error.message} (codigo ${response.error.code})`
          );
        }
        return void 0;
      })
    );
  }

  /**
   * Solo viajan los campos presentes. `undefined` significa "no tocar" y se
   * descarta; `null` si viaja, porque en las listas y el artwork borra el valor.
   */
  private toKodiParams(patch: MovieUpdate): Record<string, unknown> {
    const params: Record<string, unknown> = {};

    for (const [field, value] of Object.entries(patch)) {
      if (value === undefined) {
        continue;
      }

      const name = UPDATE_PARAM_NAMES[field as keyof MovieUpdate];
      if (name) {
        params[name] = value;
      }
    }

    return params;
  }
}
