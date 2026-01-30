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
  KodiArtistResponse
} from '../../domain/entities/artist.entity';
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
  private requestId = 1;

  getArtists(params: ArtistSearchParams): Observable<ArtistListResult> {
    const request = this.buildArtistsRequest(params);

    return this.http.post<KodiArtistsResponse>(KODI_API_URL, request).pipe(
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
        properties: [
          'thumbnail', 'fanart', 'born', 'formed', 'description',
          'died', 'disbanded', 'yearsactive', 'instrument', 'genre',
          'style', 'mood', 'musicbrainzartistid'
        ]
      },
      id: this.getNextId()
    };

    return this.http.post<KodiArtistDetailResponse>(KODI_API_URL, request).pipe(
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

    return this.http.post<KodiSongsResponse>(KODI_API_URL, request).pipe(
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

    return this.http.post<unknown>(KODI_API_URL, request).pipe(
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

    return this.http.post<unknown>(KODI_API_URL, request).pipe(
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

    return this.http.post<unknown>(KODI_API_URL, request).pipe(
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
}
