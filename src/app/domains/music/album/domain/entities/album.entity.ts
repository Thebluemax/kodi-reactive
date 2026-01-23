// ==========================================================================
// DOMAIN ENTITY - Album
// ==========================================================================

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
