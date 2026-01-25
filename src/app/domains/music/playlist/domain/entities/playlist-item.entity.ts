// ==========================================================================
// DOMAIN ENTITY - PlaylistItem
// ==========================================================================

/**
 * PlaylistItem Entity
 * Represents an item in the music playlist
 */
export interface PlaylistItem {
  readonly id: number;
  readonly position: number;
  readonly type: string;
  readonly label: string;
  readonly file: string;
  readonly duration: number;
  readonly artist: string[];
  readonly album: string;
  readonly trackNumber: number;
  readonly year: number;
  readonly thumbnail: string;
  readonly fanart: string;
}

/**
 * Playlist Result
 * Used for playlist listings
 */
export interface PlaylistResult {
  readonly items: PlaylistItem[];
  readonly total: number;
}

/**
 * Saved Playlist
 * Represents a playlist saved in localStorage
 */
export interface SavedPlaylist {
  readonly id: string;
  readonly name: string;
  readonly items: PlaylistItem[];
  readonly createdAt: string;
  readonly updatedAt: string;
}

/**
 * PlaylistItem Factory
 * Creates PlaylistItem entities from raw Kodi API responses
 */
export class PlaylistItemFactory {
  static fromKodiResponse(raw: KodiPlaylistItemResponse, position: number): PlaylistItem {
    return {
      id: raw.id,
      position,
      type: raw.type || 'song',
      label: raw.label || '',
      file: raw.file || '',
      duration: raw.duration || 0,
      artist: raw.artist || [],
      album: raw.album || '',
      trackNumber: raw.track || 0,
      year: raw.year || 0,
      thumbnail: raw.thumbnail || '',
      fanart: raw.fanart || ''
    };
  }

  static fromKodiResponseList(rawList: KodiPlaylistItemResponse[]): PlaylistItem[] {
    return rawList.map((raw, index) => PlaylistItemFactory.fromKodiResponse(raw, index));
  }

  static toSavedPlaylist(name: string, items: PlaylistItem[]): SavedPlaylist {
    const now = new Date().toISOString();
    return {
      id: crypto.randomUUID(),
      name,
      items,
      createdAt: now,
      updatedAt: now
    };
  }
}

/**
 * Kodi API Response Types
 * Raw response structure from Kodi JSON-RPC Playlist.GetItems
 */
export interface KodiPlaylistItemResponse {
  id: number;
  type: string;
  label: string;
  file: string;
  duration: number;
  artist?: string[];
  album?: string;
  track?: number;
  year?: number;
  thumbnail?: string;
  fanart?: string;
}
