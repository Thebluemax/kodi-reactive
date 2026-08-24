// ==========================================================================
// INFRASTRUCTURE - VideoGenre Kodi Repository Implementation
// ==========================================================================

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { VideoGenreRepository } from '../../domain/repositories/video-genre.repository';
import {
  VideoGenreListResult,
  VideoGenreFactory,
  KodiVideoGenreResponse
} from '../../domain/entities/video-genre.entity';
import {
  MovieListResult,
  MovieSearchParams,
  MovieFactory,
  KodiMovieResponse
} from '@domains/video/movie';
import { environment } from 'src/environments/environment';
import { KodiConfigService } from '@shared/services/kodi-config.service';
import { unwrapKodiResult } from '@shared/utils/kodi-envelope';

interface KodiJsonRpcRequest {
  jsonrpc: string;
  method: string;
  params?: Record<string, unknown>;
  id: number;
}

interface KodiGenresResponse {
  result: {
    genres: KodiVideoGenreResponse[];
  };
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

const MOVIE_PROPERTIES = [
  'title', 'genre', 'year', 'rating', 'runtime', 'plot',
  'director', 'cast', 'thumbnail', 'fanart', 'playcount',
  'dateadded', 'file', 'tagline', 'studio', 'country'
];

@Injectable({
  providedIn: 'root'
})
export class VideoGenreKodiRepository extends VideoGenreRepository {
  private readonly http = inject(HttpClient);
  private readonly config = inject(KodiConfigService);
  private requestId = 1;

  getGenres(): Observable<VideoGenreListResult> {
    const request: KodiJsonRpcRequest = {
      jsonrpc: environment.jsonrpcVersion,
      method: 'VideoLibrary.GetGenres',
      params: {
        type: 'movie',
        properties: ['title', 'thumbnail'],
        sort: { order: 'ascending', method: 'title' }
      },
      id: this.getNextId()
    };

    return this.http.post<KodiGenresResponse>(this.config.jsonRpcUrl, request).pipe(
      map(response => {
        const genres = VideoGenreFactory.fromKodiResponseList(
          unwrapKodiResult(response).genres || []
        );
        return {
          genres,
          total: genres.length
        };
      })
    );
  }

  getMoviesByGenre(genreTitle: string, params: MovieSearchParams): Observable<MovieListResult> {
    const request: KodiJsonRpcRequest = {
      jsonrpc: environment.jsonrpcVersion,
      method: 'VideoLibrary.GetMovies',
      params: {
        limits: {
          start: params.start,
          end: params.end
        },
        properties: MOVIE_PROPERTIES,
        sort: { order: 'ascending', method: 'title' },
        filter: {
          field: 'genre',
          operator: 'is',
          value: genreTitle
        }
      },
      id: this.getNextId()
    };

    return this.http.post<KodiMoviesResponse>(this.config.jsonRpcUrl, request).pipe(
      map(response => {
        const result = unwrapKodiResult(response);

        return {
          movies: MovieFactory.fromKodiResponseList(result.movies || []),
          total: result.limits.total,
          start: result.limits.start,
          end: result.limits.end
        };
      })
    );
  }

  private getNextId(): number {
    return this.requestId++;
  }
}
