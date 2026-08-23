// ==========================================================================
// DOMAIN ENTITY - Album
// ==========================================================================

import { MediaArtworkSet } from '@shared/types/media-artwork.type';

/**
 * Album Entity
 * Represents an album in the music domain
 */
export interface Album {
  readonly albumId: number;
  readonly title: string;
  readonly label: string;
  readonly artists: string[];
  readonly artistIds: number[];
  readonly genres: string[];
  readonly styles: string[];
  readonly year: number;
  readonly thumbnail: string;
  readonly fanart: string;
  readonly dateAdded: string;
  readonly playCount: number;
  readonly description?: string;
}

/**
 * Album Update
 * Campos que AudioLibrary.SetAlbumDetails admite escribir, en el vocabulario
 * del dominio. Todos opcionales: un campo ausente le dice a Kodi que no lo
 * toque, que es justo lo que queremos de una edicion parcial.
 *
 * `null` no es lo mismo que ausente: en las listas y en el artwork borra el
 * valor. Por eso el tipo lo admite donde la API lo admite.
 */
export interface AlbumUpdate {
  readonly title?: string;
  readonly artists?: string[] | null;
  readonly description?: string;
  readonly genres?: string[] | null;
  readonly themes?: string[] | null;
  readonly moods?: string[] | null;
  readonly styles?: string[] | null;
  readonly type?: string;
  readonly label?: string;
  readonly rating?: number;
  readonly year?: number;
  readonly userRating?: number;
  readonly votes?: number;
  readonly musicBrainzAlbumId?: string;
  readonly musicBrainzReleaseGroupId?: string;
  readonly sortArtist?: string;
  readonly displayArtist?: string;
  readonly musicBrainzAlbumArtistIds?: string[] | null;
  readonly art?: MediaArtworkSet | null;
  readonly isBoxSet?: boolean;
  readonly releaseDate?: string;
  readonly originalDate?: string;
}

/**
 * Album List Response
 * Used for paginated album lists
 */
export interface AlbumListResult {
  readonly albums: Album[];
  readonly total: number;
  readonly start: number;
  readonly end: number;
}

/**
 * Album Search Params
 * Parameters for searching/filtering albums
 */
export interface AlbumSearchParams {
  readonly start: number;
  readonly end: number;
  readonly searchTerm?: string;
  readonly field?: AlbumSearchField;
  readonly operator?: AlbumSearchOperator;
}

export type AlbumSearchField = 'album' | 'artist' | 'genre' | 'year';
export type AlbumSearchOperator = 'contains' | 'is' | 'startswith' | 'endswith';

/**
 * Album Factory
 * Creates Album entities from raw API responses
 */
export class AlbumFactory {
  static fromKodiResponse(raw: KodiAlbumResponse): Album {
    return {
      albumId: raw.albumid,
      title: raw.label || raw.album || '',
      label: raw.albumlabel || '',
      artists: raw.artist || [],
      artistIds: raw.artistid || [],
      genres: raw.genre || [],
      styles: raw.style || [],
      year: raw.year || 0,
      thumbnail: raw.thumbnail || '',
      fanart: raw.fanart || '',
      dateAdded: raw.dateadded || '',
      playCount: raw.playcount || 0,
      description: raw.description
    };
  }

  static fromKodiResponseList(rawList: KodiAlbumResponse[]): Album[] {
    return rawList.map(raw => AlbumFactory.fromKodiResponse(raw));
  }
}

/**
 * Kodi API Response Types
 * Raw response structure from Kodi JSON-RPC
 */
export interface KodiAlbumResponse {
  albumid: number;
  album?: string;
  albumlabel?: string;
  artist?: string[];
  artistid?: number[];
  dateadded?: string;
  fanart?: string;
  genre?: string[];
  label?: string;
  playcount?: number;
  style?: string[];
  thumbnail?: string;
  description?: string;
  year?: number;
}
