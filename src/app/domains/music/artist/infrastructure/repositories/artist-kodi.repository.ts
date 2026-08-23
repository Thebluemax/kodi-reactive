// ==========================================================================
// INFRASTRUCTURE - Artist Kodi Repository Implementation
// ==========================================================================

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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
import { environment } from 'src/environments/environment';
import { KodiConfigService } from '@shared/services/kodi-config.service';
import { Methods } from '@shared/enums/methods';

/** Kodi devuelve los rechazos con HTTP 200 y el fallo dentro del sobre. */
interface KodiJsonRpcEnvelope {
  result?: unknown;
  error?: {
    code: number;
    message: string;
  };
}

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

interface KodiJsonRpcRequest {
  jsonrpc: string;
  method: string;
  params?: Record<string, unknown>;
  id: number;
}

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
  private readonly http = inject(HttpClient);
  private readonly config = inject(KodiConfigService);
  private requestId = 1;

  getArtists(params: ArtistSearchParams): Observable<ArtistListResult> {
    const request = this.buildArtistsRequest(params);

    return this.http.post<KodiArtistsResponse>(this.config.jsonRpcUrl, request).pipe(
      map(response => ({
        artists: ArtistFactory.fromKodiResponseList(response.result.artists || []),
        total: response.result.limits.total,
        start: response.result.limits.start,
        end: response.result.limits.end
      }))
    );
  }

  getArtistById(artistId: number): Observable<Artist> {
    const request: KodiJsonRpcRequest = {
      jsonrpc: environment.jsonrpcVersion,
      method: 'AudioLibrary.GetArtistDetails',
      params: {
        artistid: artistId,
        properties: ARTIST_DETAIL_PROPERTIES
      },
      id: this.getNextId()
    };

    return this.http.post<KodiArtistDetailResponse>(this.config.jsonRpcUrl, request).pipe(
      map(response => ArtistFactory.fromKodiResponse(response.result.artistdetails))
    );
  }

  getArtistAlbums(artistId: number): Observable<ArtistAlbumGroup[]> {
    const request: KodiJsonRpcRequest = {
      jsonrpc: environment.jsonrpcVersion,
      method: 'AudioLibrary.GetSongs',
      params: {
        filter: { artistid: artistId },
        properties: [
          'title', 'artist', 'albumartist', 'genre', 'year', 'rating',
          'album', 'track', 'duration', 'playcount', 'lastplayed',
          'thumbnail', 'file', 'artistid', 'albumid'
        ],
        sort: { order: 'ascending', method: 'track', ignorearticle: true }
      },
      id: this.getNextId()
    };

    return this.http.post<KodiSongsResponse>(this.config.jsonRpcUrl, request).pipe(
      map(response => this.groupSongsByAlbumId(response.result.songs || []))
    );
  }

  addToPlaylist(artistId: number, playImmediately: boolean): Observable<void> {
    const request: KodiJsonRpcRequest = {
      jsonrpc: environment.jsonrpcVersion,
      method: playImmediately ? 'Player.Open' : 'Playlist.Add',
      params: playImmediately
        ? { item: { artistid: artistId } }
        : { playlistid: 0, item: { artistid: artistId } },
      id: this.getNextId()
    };

    return this.http.post<unknown>(this.config.jsonRpcUrl, request).pipe(
      map(() => void 0)
    );
  }

  playTrack(songId: number): Observable<void> {
    const request: KodiJsonRpcRequest = {
      jsonrpc: environment.jsonrpcVersion,
      method: 'Player.Open',
      params: {
        item: { songid: songId }
      },
      id: this.getNextId()
    };

    return this.http.post<unknown>(this.config.jsonRpcUrl, request).pipe(
      map(() => void 0)
    );
  }

  addTrackToPlaylist(songId: number): Observable<void> {
    const request: KodiJsonRpcRequest = {
      jsonrpc: environment.jsonrpcVersion,
      method: 'Playlist.Add',
      params: {
        playlistid: 0,
        item: { songid: songId }
      },
      id: this.getNextId()
    };

    return this.http.post<unknown>(this.config.jsonRpcUrl, request).pipe(
      map(() => void 0)
    );
  }

  private buildArtistsRequest(params: ArtistSearchParams): KodiJsonRpcRequest {
    const request: KodiJsonRpcRequest = {
      jsonrpc: environment.jsonrpcVersion,
      method: 'AudioLibrary.GetArtists',
      params: {
        limits: {
          start: params.start,
          end: params.end
        },
        properties: [
          'thumbnail', 'mood', 'genre', 'style'
        ],
        sort: { order: 'ascending', method: 'artist' }
      },
      id: this.getNextId()
    };

    if (params.searchTerm) {
      (request.params as Record<string, unknown>)['filter'] = {
        field: 'artist',
        operator: 'contains',
        value: params.searchTerm
      };
    }

    return request;
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

  private getNextId(): number {
    return this.requestId++;
  }

  updateArtist(artistId: number, patch: ArtistUpdate): Observable<void> {
    const request: KodiJsonRpcRequest = {
      jsonrpc: environment.jsonrpcVersion,
      method: Methods.AudioLibrarySetArtistDetails,
      params: {
        artistid: artistId,
        ...this.toKodiParams(patch)
      },
      id: this.getNextId()
    };

    return this.http.post<KodiJsonRpcEnvelope>(this.config.jsonRpcUrl, request).pipe(
      map(response => {
        if (response.error) {
          throw new Error(
            `Kodi rechazo la actualizacion: ${response.error.message} (codigo ${response.error.code})`
          );
        }
        return void 0;
      })
    );
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
