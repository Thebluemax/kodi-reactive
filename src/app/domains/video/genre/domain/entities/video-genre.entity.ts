// ==========================================================================
// DOMAIN ENTITY - VideoGenre
// ==========================================================================

/**
 * VideoGenre Entity
 * Represents a video genre in the video domain
 */
export interface VideoGenre {
  readonly genreId: number;
  readonly label: string;
  readonly title: string;
  readonly thumbnail: string;
}

/**
 * VideoGenre List Response
 * Used for genre lists
 */
export interface VideoGenreListResult {
  readonly genres: VideoGenre[];
  readonly total: number;
}

/**
 * VideoGenre Factory
 * Creates VideoGenre entities from raw API responses
 */
export class VideoGenreFactory {
  static fromKodiResponse(raw: KodiVideoGenreResponse): VideoGenre {
    return {
      genreId: raw.genreid,
      label: raw.label || '',
      title: raw.title || raw.label || '',
      thumbnail: raw.thumbnail || ''
    };
  }

  static fromKodiResponseList(rawList: KodiVideoGenreResponse[]): VideoGenre[] {
    return rawList.map(raw => VideoGenreFactory.fromKodiResponse(raw));
  }
}

/**
 * Kodi API Response Types
 * Raw response structure from Kodi JSON-RPC
 */
export interface KodiVideoGenreResponse {
  genreid: number;
  label?: string;
  title?: string;
  thumbnail?: string;
}
