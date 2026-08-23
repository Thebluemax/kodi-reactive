// ==========================================================================
// DOMAIN ENTITY - Movie
// ==========================================================================

import { MediaArtworkSet } from '@shared/types/media-artwork.type';

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
  readonly originalTitle: string;
  readonly sortTitle: string;
  readonly plotOutline: string;
  readonly writer: string[];
  readonly tag: string[];
  readonly showlink: string[];
  /** Fecha de estreno. Kodi la vincula con `year` y esta manda sobre el. */
  readonly premiered: string;
  readonly mpaa: string;
  readonly imdbNumber: string;
  /** Cadena, no numero: asi lo declara SetMovieDetails para pelicula. */
  readonly votes: string;
  readonly top250: number;
  readonly userRating: number;
  readonly trailer: string;
  /** Coleccion a la que pertenece, por ejemplo «El Padrino». */
  readonly set: string;
  readonly art: MediaArtworkSet;
}

/**
 * Movie Update
 * Campos que VideoLibrary.SetMovieDetails admite escribir, en el vocabulario
 * del dominio. Todos opcionales: un campo ausente le dice a Kodi que no lo
 * toque.
 *
 * `cast` no figura: el reparto no se puede modificar por la API, y es la razon
 * por la que los actores quedaron fuera del editor.
 */
export interface MovieUpdate {
  readonly title?: string;
  readonly originalTitle?: string;
  readonly sortTitle?: string;
  readonly tagline?: string;
  readonly plot?: string;
  readonly plotOutline?: string;
  readonly genre?: string[] | null;
  readonly director?: string[] | null;
  readonly writer?: string[] | null;
  readonly studio?: string[] | null;
  readonly country?: string[] | null;
  readonly tag?: string[] | null;
  readonly showlink?: string[] | null;
  readonly year?: number;
  readonly premiered?: string;
  /** En segundos, aunque la interfaz suela hablar de minutos. */
  readonly runtime?: number;
  readonly rating?: number;
  readonly userRating?: number;
  readonly votes?: string;
  readonly top250?: number;
  readonly mpaa?: string;
  readonly imdbNumber?: string;
  readonly trailer?: string;
  readonly set?: string;
  readonly art?: MediaArtworkSet | null;
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
      country: raw.country || [],
      originalTitle: raw.originaltitle || '',
      sortTitle: raw.sorttitle || '',
      plotOutline: raw.plotoutline || '',
      writer: raw.writer || [],
      tag: raw.tag || [],
      showlink: raw.showlink || [],
      premiered: raw.premiered || '',
      mpaa: raw.mpaa || '',
      imdbNumber: raw.imdbnumber || '',
      votes: raw.votes || '',
      top250: raw.top250 || 0,
      userRating: raw.userrating || 0,
      trailer: raw.trailer || '',
      set: raw.set || '',
      art: raw.art ?? {}
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
  originaltitle?: string;
  sorttitle?: string;
  plotoutline?: string;
  writer?: string[];
  tag?: string[];
  showlink?: string[];
  premiered?: string;
  mpaa?: string;
  imdbnumber?: string;
  votes?: string;
  top250?: number;
  userrating?: number;
  trailer?: string;
  set?: string;
  art?: Record<string, string>;
}

export interface KodiCastResponse {
  name: string;
  role: string;
  thumbnail?: string;
  order: number;
}
