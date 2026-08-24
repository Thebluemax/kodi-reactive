// ==========================================================================
// INFRASTRUCTURE - Movie Kodi Repository Implementation
// ==========================================================================

import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { MovieRepository } from '../../domain/repositories/movie.repository';
import {
  Movie,
  MovieListResult,
  MovieSearchParams,
  MovieFactory,
  KodiMovieResponse, MovieUpdate } from '../../domain/entities/movie.entity';
import { KodiRpcService } from '@shared/services/kodi-rpc.service';
import { Methods } from '@shared/enums/methods';
import { MediaRefreshOptions } from '@shared/types/media-refresh.type';

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
  art: 'art',
  uniqueId: 'uniqueid'
};

/**
 * Los parametros del refresco son opcionales en la API y tienen sus propios
 * valores por defecto: sin `title` Kodi lo deduce del archivo, y `ignorenfo` es
 * false. Mandarlos vacios no aporta nada, asi que solo viaja lo que se indica.
 */
function toRefreshParams(options: MediaRefreshOptions): Record<string, unknown> {
  const params: Record<string, unknown> = {};
  const title = options.title?.trim() ?? '';

  if (title.length > 0) {
    params['title'] = title;
  }

  if (options.ignoreNfo) {
    params['ignorenfo'] = true;
  }

  return params;
}

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
  private readonly rpc = inject(KodiRpcService);

  getMovies(params: MovieSearchParams): Observable<MovieListResult> {
    return this.rpc
      .query<KodiMoviesResponse['result']>(
        Methods.VideoLibraryGetMovies,
        this.buildMoviesParams(params)
      )
      .pipe(
      map(result => {
        return {
        movies: MovieFactory.fromKodiResponseList(result.movies || []),
        total: result.limits.total,
        start: result.limits.start,
        end: result.limits.end
        };
      })
    );
  }

  getMovieById(movieId: number): Observable<Movie> {
    return this.rpc.query<KodiMovieDetailResponse['result']>('VideoLibrary.GetMovieDetails', {
      movieid: movieId,
      properties: MOVIE_DETAIL_PROPERTIES
    }).pipe(
      map(result => {
        return MovieFactory.fromKodiResponse(result.moviedetails);
      })
    );
  }

  addToPlaylist(movieId: number, playImmediately: boolean): Observable<void> {
    return playImmediately
      ? this.rpc.command(Methods.PlayerOpen, { item: { movieid: movieId } })
      : this.rpc.command(Methods.PlaylistAdd, {
          playlistid: 1,
          item: { movieid: movieId }
        });
  }

  private buildMoviesParams(params: MovieSearchParams): Record<string, unknown> {
    const query: Record<string, unknown> = {
      limits: {
        start: params.start,
        end: params.end
      },
      properties: MOVIE_LIST_PROPERTIES,
      sort: { order: 'ascending', method: 'title' }
    };

    if (params.searchTerm) {
      query['filter'] = {
        field: params.field || 'title',
        operator: params.operator || 'contains',
        value: params.searchTerm
      };
    }

    return query;
  }

  updateMovie(movieId: number, patch: MovieUpdate): Observable<void> {
    return this.rpc.command(Methods.VideoLibrarySetMovieDetails, {
      movieid: movieId,
      ...this.toKodiParams(patch)
    });
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

  refreshMovie(movieId: number, options: MediaRefreshOptions): Observable<void> {
    return this.rpc.command(Methods.VideoLibraryRefreshMovie, {
      movieid: movieId,
      ...toRefreshParams(options)
    });
  }
}
