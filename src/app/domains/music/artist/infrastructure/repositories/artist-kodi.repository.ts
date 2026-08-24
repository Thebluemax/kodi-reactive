// ==========================================================================
// INFRASTRUCTURE - Artist Kodi Repository Implementation
// ==========================================================================

import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { ArtistRepository } from '../../domain/repositories/artist.repository';
import {
  Artist,
  ArtistListResult,
  ArtistSearchParams,
  ArtistAlbumGroup,
  ArtistFactory,
  KodiArtistResponse, ArtistUpdate } from '../../domain/entities/artist.entity';
import { Track, TrackFactory, KodiTrackResponse } from '@domains/music/track/domain/entities/track.entity';
import { KodiRpcService } from '@shared/services/kodi-rpc.service';
import { Methods } from '@shared/enums/methods';

/** Traduccion del vocabulario del dominio al de AudioLibrary.SetArtistDetails. */
const UPDATE_PARAM_NAMES: Record<keyof ArtistUpdate, string> = {
  name: 'artist',
  instruments: 'instrument',
  styles: 'style',
  moods: 'mood',
  born: 'born',
  formed: 'formed',
  description: 'description',
  genres: 'genre',
  died: 'died',
  disbanded: 'disbanded',
  yearsActive: 'yearsactive',
  musicBrainzId: 'musicbrainzartistid',
  sortName: 'sortname',
  type: 'type',
  gender: 'gender',
  disambiguation: 'disambiguation',
  art: 'art'
};

/** El detalle alimenta el editor: pide todo lo que SetArtistDetails escribe. */
const ARTIST_DETAIL_PROPERTIES = [
  'thumbnail', 'fanart', 'born', 'formed', 'description',
  'died', 'disbanded', 'yearsactive', 'instrument', 'genre',
  'style', 'mood', 'musicbrainzartistid', 'sortname', 'type',
  'gender', 'disambiguation', 'art'
];

interface KodiArtistsResponse {
  result: {
    artists: KodiArtistResponse[];
    limits: {
      start: number;
      end: number;
      total: number;
    };
  };
}

interface KodiArtistDetailResponse {
  result: {
    artistdetails: KodiArtistResponse;
  };
}

interface KodiSongsResponse {
  result: {
    songs: KodiTrackResponse[];
    limits: {
      start: number;
      end: number;
      total: number;
    };
  };
}

@Injectable({
  providedIn: 'root'
})
export class ArtistKodiRepository extends ArtistRepository {
  private readonly rpc = inject(KodiRpcService);

  getArtists(params: ArtistSearchParams): Observable<ArtistListResult> {
    return this.rpc
      .query<KodiArtistsResponse['result']>(
        Methods.AudioLibraryGetArtists,
        this.buildArtistsParams(params)
      )
      .pipe(
      map(result => {
        return {
          artists: ArtistFactory.fromKodiResponseList(result.artists || []),
          total: result.limits.total,
          start: result.limits.start,
          end: result.limits.end
        };
      })
    );
  }

  getArtistById(artistId: number): Observable<Artist> {
    return this.rpc.query<KodiArtistDetailResponse['result']>('AudioLibrary.GetArtistDetails', {
      artistid: artistId,
      properties: ARTIST_DETAIL_PROPERTIES
    }).pipe(
      map(result =>
        ArtistFactory.fromKodiResponse(result.artistdetails)
      )
    );
  }

  getArtistAlbums(artistId: number): Observable<ArtistAlbumGroup[]> {
    return this.rpc.query<KodiSongsResponse['result']>('AudioLibrary.GetSongs', {
      filter: { artistid: artistId },
      properties: [
        'title', 'artist', 'albumartist', 'genre', 'year', 'rating',
        'album', 'track', 'duration', 'playcount', 'lastplayed',
        'thumbnail', 'file', 'artistid', 'albumid'
      ],
      sort: { order: 'ascending', method: 'track', ignorearticle: true }
    }).pipe(
      map(result => this.groupSongsByAlbumId(result.songs || []))
    );
  }

  addToPlaylist(artistId: number, playImmediately: boolean): Observable<void> {
    return playImmediately
      ? this.rpc.command(Methods.PlayerOpen, { item: { artistid: artistId } })
      : this.rpc.command(Methods.PlaylistAdd, {
          playlistid: 0,
          item: { artistid: artistId }
        });
  }

  playTrack(songId: number): Observable<void> {
    return this.rpc.command(Methods.PlayerOpen, { item: { songid: songId } });
  }

  addTrackToPlaylist(songId: number): Observable<void> {
    return this.rpc.command(Methods.PlaylistAdd, {
      playlistid: 0,
      item: { songid: songId }
    });
  }

  private buildArtistsParams(params: ArtistSearchParams): Record<string, unknown> {
    const query: Record<string, unknown> = {
      limits: {
        start: params.start,
        end: params.end
      },
      properties: ['thumbnail', 'mood', 'genre', 'style'],
      sort: { order: 'ascending', method: 'artist' }
    };

    if (params.searchTerm) {
      query['filter'] = {
        field: 'artist',
        operator: 'contains',
        value: params.searchTerm
      };
    }

    return query;
  }

  /**
   * Groups songs by album ID to display albums with their tracks
   * Migrated from legacy ArtistsComponent
   */
  private groupSongsByAlbumId(songs: KodiTrackResponse[]): ArtistAlbumGroup[] {
    const albumGroups: Record<number, ArtistAlbumGroup> = {};

    songs.forEach(song => {
      const albumId = song.albumid || 0;
      const albumLabel = song.album || '';
      const albumThumbnail = song.thumbnail || '';

      if (!albumGroups[albumId]) {
        albumGroups[albumId] = {
          albumId,
          albumLabel,
          albumThumbnail,
          tracks: []
        };
      }

      albumGroups[albumId] = {
        ...albumGroups[albumId],
        tracks: [...albumGroups[albumId].tracks, TrackFactory.fromKodiResponse(song)]
      };
    });

    return Object.values(albumGroups);
  }

  updateArtist(artistId: number, patch: ArtistUpdate): Observable<void> {
    return this.rpc.command(Methods.AudioLibrarySetArtistDetails, {
      artistid: artistId,
      ...this.toKodiParams(patch)
    });
  }

  /**
   * Solo viajan los campos presentes. `undefined` significa "no tocar" y se
   * descarta; `null` si viaja, porque en las listas y el artwork borra el valor.
   */
  private toKodiParams(patch: ArtistUpdate): Record<string, unknown> {
    const params: Record<string, unknown> = {};

    for (const [field, value] of Object.entries(patch)) {
      if (value === undefined) {
        continue;
      }

      const name = UPDATE_PARAM_NAMES[field as keyof ArtistUpdate];
      if (name) {
        params[name] = value;
      }
    }

    return params;
  }
}
