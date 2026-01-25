// ==========================================================================
// DOMAIN ENTITY - Current Track
// ==========================================================================

/**
 * Represents the currently playing track
 */
export interface CurrentTrack {
  id: number;
  type: string;
  label: string;
  title: string;
  artist: string[];
  album: string;
  year: number;
  genre: string[];
  track: number;
  duration: number;
  thumbnail: string;
  fanart: string;
  file: string;
  albumId: number;
  artistId: number[];
  rating: number;
  playcount: number;
  dateAdded: string;
}

/**
 * Raw Kodi response for Player.GetItem
 */
export interface KodiCurrentTrackResponse {
  id: number;
  type: string;
  label: string;
  title: string;
  artist: string[];
  album: string;
  year: number;
  genre: string[];
  track: number;
  duration: number;
  thumbnail: string;
  fanart: string;
  file: string;
  albumid: number;
  artistid: number[];
  rating: number;
  playcount: number;
  dateadded: string;
}

/**
 * Factory to create CurrentTrack from Kodi API responses
 */
export class CurrentTrackFactory {
  static fromKodiResponse(response: KodiCurrentTrackResponse): CurrentTrack {
    return {
      id: response.id,
      type: response.type,
      label: response.label || response.title || '',
      title: response.title || '',
      artist: response.artist || [],
      album: response.album || '',
      year: response.year || 0,
      genre: response.genre || [],
      track: response.track || 0,
      duration: response.duration || 0,
      thumbnail: response.thumbnail || '',
      fanart: response.fanart || '',
      file: response.file || '',
      albumId: response.albumid || 0,
      artistId: response.artistid || [],
      rating: response.rating || 0,
      playcount: response.playcount || 0,
      dateAdded: response.dateadded || ''
    };
  }

  static createEmpty(): CurrentTrack {
    return {
      id: 0,
      type: 'unknown',
      label: '',
      title: '',
      artist: [],
      album: '',
      year: 0,
      genre: [],
      track: 0,
      duration: 0,
      thumbnail: '',
      fanart: '',
      file: '',
      albumId: 0,
      artistId: [],
      rating: 0,
      playcount: 0,
      dateAdded: ''
    };
  }
}
