// ==========================================================================
// DOMAIN ENTITY - Artist
// ==========================================================================

import { Track } from '@domains/music/track/domain/entities/track.entity';

/**
 * Artist Entity
 * Represents an artist in the music domain
 */
export interface Artist {
  readonly artistId: number;
  readonly name: string;
  readonly label: string;
  readonly genres: string[];
  readonly styles: string[];
  readonly moods: string[];
  readonly thumbnail: string;
  readonly fanart: string;
  readonly born?: string;
  readonly formed?: string;
  readonly died?: string;
  readonly disbanded?: string;
  readonly yearsActive: string[];
  readonly instruments: string[];
  readonly description?: string;
  readonly musicBrainzId?: string[];
}

/**
 * Artist List Response
 * Used for paginated artist lists
 */
export interface ArtistListResult {
  readonly artists: Artist[];
  readonly total: number;
  readonly start: number;
  readonly end: number;
}

/**
 * Artist Search Params
 * Parameters for searching/filtering artists
 */
export interface ArtistSearchParams {
  readonly start: number;
  readonly end: number;
  readonly searchTerm?: string;
}

/**
 * Artist Album Group
 * Represents an album with its tracks for an artist
 */
export interface ArtistAlbumGroup {
  readonly albumId: number;
  readonly albumLabel: string;
  readonly albumThumbnail: string;
  readonly tracks: Track[];
}

/**
 * Artist Factory
 * Creates Artist entities from raw API responses
 */
export class ArtistFactory {
  static fromKodiResponse(raw: KodiArtistResponse): Artist {
    return {
      artistId: raw.artistid,
      name: raw.artist || raw.label || '',
      label: raw.label || '',
      genres: raw.genre || [],
      styles: raw.style || [],
      moods: raw.mood || [],
      thumbnail: raw.thumbnail || '',
      fanart: raw.fanart || '',
      born: raw.born,
      formed: raw.formed,
      died: raw.died,
      disbanded: raw.disbanded,
      yearsActive: raw.yearsactive || [],
      instruments: raw.instrument || [],
      description: raw.description,
      musicBrainzId: raw.musicbrainzartistid
    };
  }

  static fromKodiResponseList(rawList: KodiArtistResponse[]): Artist[] {
    return rawList.map(raw => ArtistFactory.fromKodiResponse(raw));
  }
}

/**
 * Kodi API Response Types
 * Raw response structure from Kodi JSON-RPC
 */
export interface KodiArtistResponse {
  artistid: number;
  artist?: string;
  label?: string;
  born?: string;
  description?: string;
  died?: string;
  disbanded?: string;
  fanart?: string;
  formed?: string;
  genre?: string[];
  instrument?: string[];
  mood?: string[];
  musicbrainzartistid?: string[];
  style?: string[];
  thumbnail?: string;
  yearsactive?: string[];
}
