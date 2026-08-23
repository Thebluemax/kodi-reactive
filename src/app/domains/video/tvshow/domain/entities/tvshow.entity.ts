// ==========================================================================
// DOMAIN ENTITY - TVShow
// ==========================================================================

import { MediaArtworkSet } from '@shared/types/media-artwork.type';

import { CastMember, KodiCastResponse } from '@domains/video/movie';

/**
 * TVShow Entity
 * Represents a TV show in the video domain
 */
export interface TVShow {
  readonly tvshowId: number;
  readonly title: string;
  readonly genre: string[];
  readonly year: number;
  readonly rating: number;
  readonly plot: string;
  readonly cast: CastMember[];
  readonly thumbnail: string;
  readonly fanart: string;
  readonly season: number;
  readonly episode: number;
  readonly playCount: number;
  readonly dateAdded: string;
  readonly studio: string[];
  readonly originalTitle: string;
  readonly sortTitle: string;
  /**
   * Fecha de estreno. SetTVShowDetails no acepta `year`: el año que la entidad
   * expone es de lectura y sale de aqui.
   */
  readonly premiered: string;
  readonly mpaa: string;
  readonly imdbNumber: string;
  /** Cadena, no numero, igual que en pelicula. */
  readonly votes: string;
  readonly userRating: number;
  readonly episodeGuide: string;
  readonly tag: string[];
  /** Enumerado cerrado de la API. */
  readonly status: string;
  /** En segundos. */
  readonly runtime: number;
  readonly art: MediaArtworkSet;
}

/** Valores que VideoLibrary.SetTVShowDetails admite en `status`. */
export const TVSHOW_STATUSES = [
  'returning series',
  'in production',
  'planned',
  'cancelled',
  'ended'
] as const;

/**
 * TVShow Update
 * Campos que VideoLibrary.SetTVShowDetails admite escribir. Todos opcionales:
 * un campo ausente le dice a Kodi que no lo toque.
 *
 * No incluye `year`, que la API no admite escribir para series, ni `cast`, que
 * no es editable en ningun medio.
 */
export interface TVShowUpdate {
  readonly title?: string;
  readonly originalTitle?: string;
  readonly sortTitle?: string;
  readonly plot?: string;
  readonly genre?: string[] | null;
  readonly studio?: string[] | null;
  readonly tag?: string[] | null;
  readonly premiered?: string;
  readonly runtime?: number;
  readonly rating?: number;
  readonly userRating?: number;
  readonly votes?: string;
  readonly mpaa?: string;
  readonly imdbNumber?: string;
  readonly episodeGuide?: string;
  readonly status?: string;
  readonly art?: MediaArtworkSet | null;
}

/**
 * Season Entity
 * Represents a season of a TV show
 */
export interface Season {
  readonly seasonId: number;
  readonly season: number;
  readonly label: string;
  readonly episode: number;
  readonly watchedEpisodes: number;
  readonly playCount: number;
  readonly thumbnail: string;
}

/**
 * Episode Entity
 * Represents a single episode of a TV show
 */
export interface Episode {
  readonly episodeId: number;
  readonly title: string;
  readonly plot: string;
  readonly runtime: number;
  readonly season: number;
  readonly episode: number;
  readonly file: string;
  readonly thumbnail: string;
  readonly playCount: number;
  readonly dateAdded: string;
  readonly firstAired: string;
  readonly rating: number;
}

/**
 * TVShow List Response
 * Used for paginated TV show lists
 */
export interface TVShowListResult {
  readonly tvshows: TVShow[];
  readonly total: number;
  readonly start: number;
  readonly end: number;
}

/**
 * TVShow Search Params
 * Parameters for searching/filtering TV shows
 */
export interface TVShowSearchParams {
  readonly start: number;
  readonly end: number;
  readonly searchTerm?: string;
  readonly field?: TVShowSearchField;
  readonly operator?: TVShowSearchOperator;
}

export type TVShowSearchField = 'title' | 'genre' | 'year' | 'studio';
export type TVShowSearchOperator = 'contains' | 'is' | 'startswith' | 'endswith';

/**
 * TVShow Factory
 * Creates TVShow entities from raw API responses
 */
export class TVShowFactory {
  static fromKodiResponse(raw: KodiTVShowResponse): TVShow {
    return {
      tvshowId: raw.tvshowid,
      title: raw.label || raw.title || '',
      genre: raw.genre || [],
      year: raw.year || 0,
      rating: raw.rating || 0,
      plot: raw.plot || '',
      cast: (raw.cast || []).map(c => ({
        name: c.name,
        role: c.role,
        thumbnail: c.thumbnail,
        order: c.order
      })),
      thumbnail: raw.thumbnail || '',
      fanart: raw.fanart || '',
      season: raw.season || 0,
      episode: raw.episode || 0,
      playCount: raw.playcount || 0,
      dateAdded: raw.dateadded || '',
      studio: raw.studio || [],
      originalTitle: raw.originaltitle || '',
      sortTitle: raw.sorttitle || '',
      premiered: raw.premiered || '',
      mpaa: raw.mpaa || '',
      imdbNumber: raw.imdbnumber || '',
      votes: raw.votes || '',
      userRating: raw.userrating || 0,
      episodeGuide: raw.episodeguide || '',
      tag: raw.tag || [],
      status: raw.status || '',
      runtime: raw.runtime || 0,
      art: raw.art ?? {}
    };
  }

  static fromKodiResponseList(rawList: KodiTVShowResponse[]): TVShow[] {
    return rawList.map(raw => TVShowFactory.fromKodiResponse(raw));
  }
}

/**
 * Season Factory
 * Creates Season entities from raw API responses
 */
export class SeasonFactory {
  static fromKodiResponse(raw: KodiSeasonResponse): Season {
    return {
      seasonId: raw.seasonid,
      season: raw.season,
      label: raw.label || '',
      episode: raw.episode || 0,
      watchedEpisodes: raw.watchedepisodes || 0,
      playCount: raw.playcount || 0,
      thumbnail: raw.thumbnail || ''
    };
  }

  static fromKodiResponseList(rawList: KodiSeasonResponse[]): Season[] {
    return rawList.map(raw => SeasonFactory.fromKodiResponse(raw));
  }
}

/**
 * Episode Factory
 * Creates Episode entities from raw API responses
 */
export class EpisodeFactory {
  static fromKodiResponse(raw: KodiEpisodeResponse): Episode {
    return {
      episodeId: raw.episodeid,
      title: raw.label || raw.title || '',
      plot: raw.plot || '',
      runtime: raw.runtime || 0,
      season: raw.season || 0,
      episode: raw.episode || 0,
      file: raw.file || '',
      thumbnail: raw.thumbnail || '',
      playCount: raw.playcount || 0,
      dateAdded: raw.dateadded || '',
      firstAired: raw.firstaired || '',
      rating: raw.rating || 0
    };
  }

  static fromKodiResponseList(rawList: KodiEpisodeResponse[]): Episode[] {
    return rawList.map(raw => EpisodeFactory.fromKodiResponse(raw));
  }
}

/**
 * Kodi API Response Types
 * Raw response structure from Kodi JSON-RPC
 */
export interface KodiTVShowResponse {
  tvshowid: number;
  title?: string;
  label?: string;
  genre?: string[];
  year?: number;
  rating?: number;
  plot?: string;
  cast?: KodiCastResponse[];
  thumbnail?: string;
  fanart?: string;
  season?: number;
  episode?: number;
  playcount?: number;
  dateadded?: string;
  studio?: string[];
  originaltitle?: string;
  sorttitle?: string;
  premiered?: string;
  mpaa?: string;
  imdbnumber?: string;
  votes?: string;
  userrating?: number;
  episodeguide?: string;
  tag?: string[];
  status?: string;
  runtime?: number;
  art?: Record<string, string>;
}

export interface KodiSeasonResponse {
  seasonid: number;
  season: number;
  label?: string;
  episode?: number;
  watchedepisodes?: number;
  playcount?: number;
  thumbnail?: string;
}

export interface KodiEpisodeResponse {
  episodeid: number;
  title?: string;
  label?: string;
  plot?: string;
  runtime?: number;
  season?: number;
  episode?: number;
  file?: string;
  thumbnail?: string;
  playcount?: number;
  dateadded?: string;
  firstaired?: string;
  rating?: number;
}
