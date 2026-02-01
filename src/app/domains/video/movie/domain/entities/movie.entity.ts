// ==========================================================================
// DOMAIN ENTITY - Movie
// ==========================================================================

/**
 * Movie Entity
 * Represents a movie in the video domain
 */
export interface Movie {
  readonly movieId: number;
  readonly title: string;
  readonly genre: string[];
  readonly year: number;
  readonly rating: number;
  readonly runtime: number;
  readonly plot: string;
  readonly director: string[];
  readonly cast: CastMember[];
  readonly thumbnail: string;
  readonly fanart: string;
  readonly playCount: number;
  readonly dateAdded: string;
  readonly file: string;
  readonly tagline: string;
  readonly studio: string[];
  readonly country: string[];
}

export interface CastMember {
  readonly name: string;
  readonly role: string;
  readonly thumbnail?: string;
  readonly order: number;
}

/**
 * Movie List Response
 * Used for paginated movie lists
 */
export interface MovieListResult {
  readonly movies: Movie[];
  readonly total: number;
  readonly start: number;
  readonly end: number;
}

/**
 * Movie Search Params
 * Parameters for searching/filtering movies
 */
export interface MovieSearchParams {
  readonly start: number;
  readonly end: number;
  readonly searchTerm?: string;
  readonly field?: MovieSearchField;
  readonly operator?: MovieSearchOperator;
}

export type MovieSearchField = 'title' | 'genre' | 'year' | 'director' | 'studio' | 'country';
export type MovieSearchOperator = 'contains' | 'is' | 'startswith' | 'endswith';

/**
 * Movie Factory
 * Creates Movie entities from raw API responses
 */
export class MovieFactory {
  static fromKodiResponse(raw: KodiMovieResponse): Movie {
    return {
      movieId: raw.movieid,
      title: raw.label || raw.title || '',
      genre: raw.genre || [],
      year: raw.year || 0,
      rating: raw.rating || 0,
      runtime: raw.runtime || 0,
      plot: raw.plot || '',
      director: raw.director || [],
      cast: (raw.cast || []).map(c => ({
        name: c.name,
        role: c.role,
        thumbnail: c.thumbnail,
        order: c.order
      })),
      thumbnail: raw.thumbnail || '',
      fanart: raw.fanart || '',
      playCount: raw.playcount || 0,
      dateAdded: raw.dateadded || '',
      file: raw.file || '',
      tagline: raw.tagline || '',
      studio: raw.studio || [],
      country: raw.country || []
    };
  }

  static fromKodiResponseList(rawList: KodiMovieResponse[]): Movie[] {
    return rawList.map(raw => MovieFactory.fromKodiResponse(raw));
  }
}

/**
 * Kodi API Response Types
 * Raw response structure from Kodi JSON-RPC
 */
export interface KodiMovieResponse {
  movieid: number;
  title?: string;
  label?: string;
  genre?: string[];
  year?: number;
  rating?: number;
  runtime?: number;
  plot?: string;
  director?: string[];
  cast?: KodiCastResponse[];
  thumbnail?: string;
  fanart?: string;
  playcount?: number;
  dateadded?: string;
  file?: string;
  tagline?: string;
  studio?: string[];
  country?: string[];
}

export interface KodiCastResponse {
  name: string;
  role: string;
  thumbnail?: string;
  order: number;
}
