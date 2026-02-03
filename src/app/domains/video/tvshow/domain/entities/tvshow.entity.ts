// ==========================================================================
// DOMAIN ENTITY - TVShow
// ==========================================================================

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
      studio: raw.studio || []
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
