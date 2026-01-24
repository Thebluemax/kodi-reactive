// ==========================================================================
// DOMAIN ENTITY - Genre
// ==========================================================================

/**
 * Genre Entity
 * Represents a music genre in the music domain
 */
export interface Genre {
  readonly genreId: number;
  readonly label: string;
  readonly title: string;
  readonly thumbnail: string;
}

/**
 * Genre List Response
 * Used for genre lists
 */
export interface GenreListResult {
  readonly genres: Genre[];
  readonly total: number;
}

/**
 * Genre Factory
 * Creates Genre entities from raw API responses
 */
export class GenreFactory {
  static fromKodiResponse(raw: KodiGenreResponse): Genre {
    return {
      genreId: raw.genreid,
      label: raw.label || '',
      title: raw.title || raw.label || '',
      thumbnail: raw.thumbnail || ''
    };
  }

  static fromKodiResponseList(rawList: KodiGenreResponse[]): Genre[] {
    return rawList.map(raw => GenreFactory.fromKodiResponse(raw));
  }
}

/**
 * Kodi API Response Types
 * Raw response structure from Kodi JSON-RPC AudioLibrary.GetGenres
 */
export interface KodiGenreResponse {
  genreid: number;
  label?: string;
  title?: string;
  thumbnail?: string;
}
