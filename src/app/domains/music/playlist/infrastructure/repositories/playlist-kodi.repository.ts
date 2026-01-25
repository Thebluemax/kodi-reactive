// ==========================================================================
// INFRASTRUCTURE - Playlist Kodi Repository Implementation
// ==========================================================================

import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

import { PlaylistRepository } from '../../domain/repositories/playlist.repository';
import { PlaylistItem, PlaylistItemFactory, PlaylistResult, KodiPlaylistItemResponse } from '../../domain/entities/playlist-item.entity';

// TODO: Move to core/infrastructure/config
const KODI_API_URL = 'http://localhost:8008/jsonrpc';

interface KodiJsonRpcRequest {
  jsonrpc: '2.0';
  method: string;
  params?: Record<string, unknown>;
  id: number;
}

interface KodiJsonRpcResponse<T = unknown> {
  jsonrpc: '2.0';
  result?: T;
  error?: {
    code: number;
    message: string;
  };
  id: number;
}

interface KodiPlaylistResponse {
  limits: {
    end: number;
    start: number;
    total: number;
  };
  items?: KodiPlaylistItemResponse[];
}

@Injectable({
  providedIn: 'root'
})
export class PlaylistKodiRepository extends PlaylistRepository {
  private readonly http = inject(HttpClient);
  private requestId = 1;

  getPlaylist(playlistId: number = 0): Observable<PlaylistResult> {
    const request: KodiJsonRpcRequest = {
      jsonrpc: '2.0',
      method: 'Playlist.GetItems',
      params: {
        playlistid: playlistId,
        properties: [
          'title', 'artist', 'album', 'duration',
          'track', 'year', 'thumbnail', 'fanart', 'file'
        ]
      },
      id: this.getNextId()
    };

    return this.http.post<KodiJsonRpcResponse<KodiPlaylistResponse>>(KODI_API_URL, request).pipe(
      map(response => {
        if (response.error) {
          throw new Error(`Kodi API Error: ${response.error.message}`);
        }
        const items = PlaylistItemFactory.fromKodiResponseList(response.result?.items || []);
        return {
          items,
          total: response.result?.limits?.total || 0
        };
      })
    );
  }

  clearPlaylist(playlistId: number = 0): Observable<void> {
    const request: KodiJsonRpcRequest = {
      jsonrpc: '2.0',
      method: 'Playlist.Clear',
      params: {
        playlistid: playlistId
      },
      id: this.getNextId()
    };

    return this.http.post<KodiJsonRpcResponse>(KODI_API_URL, request).pipe(
      map(response => {
        if (response.error) {
          throw new Error(`Failed to clear playlist: ${response.error.message}`);
        }
      })
    );
  }

  removeItem(position: number, playlistId: number = 0): Observable<void> {
    const request: KodiJsonRpcRequest = {
      jsonrpc: '2.0',
      method: 'Playlist.Remove',
      params: {
        playlistid: playlistId,
        position
      },
      id: this.getNextId()
    };

    return this.http.post<KodiJsonRpcResponse>(KODI_API_URL, request).pipe(
      map(response => {
        if (response.error) {
          throw new Error(`Failed to remove item: ${response.error.message}`);
        }
      })
    );
  }

  swapItems(position1: number, position2: number, playlistId: number = 0): Observable<void> {
    const request: KodiJsonRpcRequest = {
      jsonrpc: '2.0',
      method: 'Playlist.Swap',
      params: {
        playlistid: playlistId,
        position1,
        position2
      },
      id: this.getNextId()
    };

    return this.http.post<KodiJsonRpcResponse>(KODI_API_URL, request).pipe(
      map(response => {
        if (response.error) {
          throw new Error(`Failed to swap items: ${response.error.message}`);
        }
      })
    );
  }

  playItem(position: number, playlistId: number = 0): Observable<void> {
    const request: KodiJsonRpcRequest = {
      jsonrpc: '2.0',
      method: 'Player.Open',
      params: {
        item: {
          playlistid: playlistId,
          position
        }
      },
      id: this.getNextId()
    };

    return this.http.post<KodiJsonRpcResponse>(KODI_API_URL, request).pipe(
      map(response => {
        if (response.error) {
          throw new Error(`Failed to play item: ${response.error.message}`);
        }
      })
    );
  }

  addItem(songId: number, playlistId: number = 0): Observable<void> {
    const request: KodiJsonRpcRequest = {
      jsonrpc: '2.0',
      method: 'Playlist.Add',
      params: {
        playlistid: playlistId,
        item: {
          songid: songId
        }
      },
      id: this.getNextId()
    };

    return this.http.post<KodiJsonRpcResponse>(KODI_API_URL, request).pipe(
      map(response => {
        if (response.error) {
          throw new Error(`Failed to add item: ${response.error.message}`);
        }
      })
    );
  }

  private getNextId(): number {
    return this.requestId++;
  }
}
