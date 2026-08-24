// ==========================================================================
// DOMAIN ENTITY - Track
// ==========================================================================

/**
 * Track Entity
 * Represents a song/track in the music domain
 */
export interface Track {
  readonly songId: number;
  readonly title: string;
  readonly label: string;
  readonly album: string;
  readonly albumId: number;
  readonly artists: string[];
  readonly artistIds: number[];
  readonly trackNumber: number;
  readonly duration: number;
  readonly year: number;
  readonly file: string;
  readonly thumbnail: string;
  readonly lastPlayed: string;
}

/**
 * Track List Result
 * Used for track listings
 */
export interface TrackListResult {
  readonly tracks: Track[];
  readonly total: number;
}

/**
 * Track Factory
 * Creates Track entities from raw API responses
 */
export class TrackFactory {
  static fromKodiResponse(raw: KodiTrackResponse): Track {
    return {
      songId: raw.songid,
      title: raw.title || raw.label || '',
      label: raw.label || '',
      album: raw.album || '',
      albumId: raw.albumid || 0,
      artists: raw.artist || [],
      artistIds: raw.artistid || [],
      trackNumber: raw.track || 0,
      duration: raw.duration || 0,
      year: raw.year || 0,
      file: raw.file || '',
      thumbnail: raw.thumbnail || '',
      lastPlayed: raw.lastplayed || ''
    };
  }

  static fromKodiResponseList(rawList: KodiTrackResponse[]): Track[] {
    return rawList.map(raw => TrackFactory.fromKodiResponse(raw));
  }
}

/**
 * Kodi API Response Types
 * Raw response structure from Kodi JSON-RPC
 */
/**
 * Track Update
 * Campos que AudioLibrary.SetSongDetails admite escribir, en el vocabulario del
 * dominio. Todos opcionales: un campo ausente le dice a Kodi que no lo toque.
 */
export interface TrackUpdate {
  readonly title?: string;
  readonly artists?: string[] | null;
  readonly genres?: string[] | null;
  readonly year?: number;
  readonly rating?: number;
  readonly userRating?: number;
  readonly votes?: number;
  readonly trackNumber?: number;
  readonly disc?: number;
  readonly discTitle?: string;
  readonly duration?: number;
  readonly comment?: string;
  readonly mood?: string;
  readonly displayArtist?: string;
  readonly sortArtist?: string;
  readonly musicBrainzTrackId?: string;
  readonly musicBrainzArtistId?: string;
  readonly releaseDate?: string;
  readonly originalDate?: string;
  readonly bpm?: number;
  readonly art?: Record<string, string | null> | null;
}

export interface KodiTrackResponse {
  songid: number;
  title?: string;
  label?: string;
  album?: string;
  albumid?: number;
  artist?: string[];
  artistid?: number[];
  track?: number;
  duration?: number;
  year?: number;
  file?: string;
  thumbnail?: string;
  lastplayed?: string;
}
