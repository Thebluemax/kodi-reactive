// ==========================================================================
// INFRASTRUCTURE - Album Kodi Repository Implementation
// ==========================================================================

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { AlbumRepository } from '../../domain/repositories/album.repository';
import {
  Album,
  AlbumListResult,
  AlbumSearchParams,
  AlbumFactory,
  KodiAlbumResponse
} from '../../domain/entities/album.entity';
import { Track, TrackFactory, KodiTrackResponse } from '@domains/music/track/domain/entities/track.entity';
import { environment } from 'src/environments/environment';

// TODO: Move to core/infrastructure/config
const KODI_API_URL = `${environment.serverApiUrl}:${environment.apiPort}/jsonrpc`;

interface KodiJsonRpcRequest {
  jsonrpc: string;
  method: string;
  params?: Record<string, unknown>;
  id: number;
}

interface KodiAlbumsResponse {
  result: {
    albums: KodiAlbumResponse[];
    limits: {
      start: number;
      end: number;
      total: number;
    };
  };
}

interface KodiAlbumDetailResponse {
  result: {
    albumdetails: KodiAlbumResponse;
  };
}

interface KodiTracksResponse {
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
export class AlbumKodiRepository extends AlbumRepository {
  private readonly http = inject(HttpClient);
  private requestId = 1;

  getAlbums(params: AlbumSearchParams): Observable<AlbumListResult> {
    const request = this.buildAlbumsRequest(params);

    return this.http.post<KodiAlbumsResponse>(KODI_API_URL, request).pipe(
      map(response => ({
        albums: AlbumFactory.fromKodiResponseList(response.result.albums || []),
        total: response.result.limits.total,
        start: response.result.limits.start,
        end: response.result.limits.end
      }))
    );
  }

  getAlbumById(albumId: number): Observable<Album> {
    const request: KodiJsonRpcRequest = {
      jsonrpc: environment.jsonrpcVersion,
      method: 'AudioLibrary.GetAlbumDetails',
      params: {
        albumid: albumId,
        properties: [
          'thumbnail', 'playcount', 'artistid', 'artist', 'genre',
          'albumlabel', 'year', 'dateadded', 'style', 'fanart',
          'mood', 'description', 'rating', 'type', 'theme'
        ]
      },
      id: this.getNextId()
    };

    return this.http.post<KodiAlbumDetailResponse>(KODI_API_URL, request).pipe(
      map(response => {
        if ((response as any).error) {
          throw new Error((response as any).error.message || 'Unknown Kodi error');
        }
        return AlbumFactory.fromKodiResponse(response.result.albumdetails);
      })
    );
  }

  getAlbumTracks(albumId: number): Observable<Track[]> {
    const request: KodiJsonRpcRequest = {
      jsonrpc: environment.jsonrpcVersion,
      method: 'AudioLibrary.GetSongs',
      params: {
        filter: { albumid: albumId },
        properties: [
          'title', 'artist', 'albumartist', 'genre', 'year', 'rating',
          'album', 'track', 'duration', 'playcount', 'lastplayed',
          'thumbnail', 'file', 'artistid', 'albumid'
        ],
        sort: { order: 'ascending', method: 'track' }
      },
      id: this.getNextId()
    };

    return this.http.post<KodiTracksResponse>(KODI_API_URL, request).pipe(
      map(response => TrackFactory.fromKodiResponseList(response.result.songs || []))
    );
  }

  addToPlaylist(albumId: number, playImmediately: boolean): Observable<void> {
    const request: KodiJsonRpcRequest = {
      jsonrpc: environment.jsonrpcVersion,
      method: playImmediately ? 'Player.Open' : 'Playlist.Add',
      params: playImmediately
        ? { item: { albumid: albumId } }
        : { playlistid: 0, item: { albumid: albumId } },
      id: this.getNextId()
    };

    return this.http.post<unknown>(KODI_API_URL, request).pipe(
      map(() => void 0)
    );
  }

  private buildAlbumsRequest(params: AlbumSearchParams): KodiJsonRpcRequest {
    const request: KodiJsonRpcRequest = {
      jsonrpc: environment.jsonrpcVersion,
      method: 'AudioLibrary.GetAlbums',
      params: {
        limits: {
          start: params.start,
          end: params.end
        },
        properties: [
          'title', 'description', 'artist', 'genre', 'theme', 'mood',
          'style', 'type', 'albumlabel', 'rating', 'year',
          'fanart', 'thumbnail', 'playcount', 'artistid', 'dateadded'
        ],
        sort: { order: 'ascending', method: 'album' }
      },
      id: this.getNextId()
    };

    if (params.searchTerm) {
      (request.params as Record<string, unknown>)['filter'] = {
        field: params.field || 'album',
        operator: params.operator || 'contains',
        value: params.searchTerm
      };
    }

    return request;
  }

  private getNextId(): number {
    return this.requestId++;
  }
}
