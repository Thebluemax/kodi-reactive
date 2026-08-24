// ==========================================================================
// INFRASTRUCTURE - VideoGenre Kodi Repository Implementation
// ==========================================================================

import { Injectable, inject } from '@angular/core';
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
import { KodiRpcService } from '@shared/services/kodi-rpc.service';

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
  private readonly rpc = inject(KodiRpcService);

  getGenres(): Observable<VideoGenreListResult> {
    return this.rpc.query<KodiGenresResponse['result']>('VideoLibrary.GetGenres', {
      type: 'movie',
      properties: ['title', 'thumbnail'],
      sort: { order: 'ascending', method: 'title' }
    }).pipe(
      map(result => {
        const genres = VideoGenreFactory.fromKodiResponseList(
          result.genres || []
        );
        return {
          genres,
          total: genres.length
        };
      })
    );
  }

  getMoviesByGenre(genreTitle: string, params: MovieSearchParams): Observable<MovieListResult> {
    return this.rpc.query<KodiMoviesResponse['result']>('VideoLibrary.GetMovies', {
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
    }).pipe(
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
}
