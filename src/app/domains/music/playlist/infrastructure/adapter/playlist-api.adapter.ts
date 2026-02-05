import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BaseApiService } from '@core/infrastructure/base/base-api.service';

// Kodi JSON-RPC interfaces
interface KodiJsonRpcRequest {
  jsonrpc: '2.0';
  method: string;
  params?: any;
  id: number;
}

interface KodiJsonRpcResponse<T = any> {
  jsonrpc: '2.0';
  result?: T;
  error?: {
    code: number;
    message: string;
  };
  id: number;
}

interface KodiPlaylistItem {
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

interface KodiPlaylistResponse {
  limits: {
    end: number;
    start: number;
    total: number;
  };
  items: KodiPlaylistItem[];
}

@Injectable({
  providedIn: 'root'
})
export class PlaylistApiAdapter {
  private readonly baseApiService = inject(BaseApiService);
  private requestId = 1;

  /**
   * Get current audio playlist from Kodi
   */
  getCurrentPlaylist(): Observable<KodiPlaylistItem[]> {
    const request: KodiJsonRpcRequest = {
      jsonrpc: '2.0',
      method: 'Playlist.GetItems',
      params: {
        playlistid: 0, // Audio playlist ID
        properties: [
          'title', 'artist', 'album', 'duration', 
          'track', 'year', 'thumbnail', 'fanart', 'file'
        ]
      },
      id: this.getNextId()
    };

    return this.baseApiService.post<KodiJsonRpcResponse<KodiPlaylistResponse>>('/jsonrpc', request)
      .pipe(
        map(response => {
          if (response.error) {
            throw new Error(`Kodi API Error: ${response.error.message}`);
          }
          return response.result?.items || [];
        })
      );
  }

  /**
   * Add item to playlist
   */
  addToPlaylist(songId: number): Observable<string> {
    const request: KodiJsonRpcRequest = {
      jsonrpc: '2.0',
      method: 'Playlist.Add',
      params: {
        playlistid: 0,
        item: {
          songid: songId
        }
      },
      id: this.getNextId()
    };

    return this.baseApiService.post<KodiJsonRpcResponse<string>>('/jsonrpc', request)
      .pipe(
        map(response => {
          if (response.error) {
            throw new Error(`Failed to add to playlist: ${response.error.message}`);
          }
          return response.result || 'OK';
        })
      );
  }

  /**
   * Remove item from playlist
   */
  removeFromPlaylist(position: number): Observable<string> {
    const request: KodiJsonRpcRequest = {
      jsonrpc: '2.0',
      method: 'Playlist.Remove',
      params: {
        playlistid: 0,
        position: position
      },
      id: this.getNextId()
    };

    return this.baseApiService.post<KodiJsonRpcResponse<string>>('/jsonrpc', request)
      .pipe(
        map(response => {
          if (response.error) {
            throw new Error(`Failed to remove from playlist: ${response.error.message}`);
          }
          return response.result || 'OK';
        })
      );
  }

  /**
   * Clear entire playlist
   */
  clearPlaylist(): Observable<string> {
    const request: KodiJsonRpcRequest = {
      jsonrpc: '2.0',
      method: 'Playlist.Clear',
      params: {
        playlistid: 0
      },
      id: this.getNextId()
    };

    return this.baseApiService.post<KodiJsonRpcResponse<string>>('/jsonrpc', request)
      .pipe(
        map(response => {
          if (response.error) {
            throw new Error(`Failed to clear playlist: ${response.error.message}`);
          }
          return response.result || 'OK';
        })
      );
  }

  /**
   * Swap two items in playlist
   */
  swapPlaylistItems(position1: number, position2: number): Observable<string> {
    const request: KodiJsonRpcRequest = {
      jsonrpc: '2.0',
      method: 'Playlist.Swap',
      params: {
        playlistid: 0,
        position1: position1,
        position2: position2
      },
      id: this.getNextId()
    };

    return this.baseApiService.post<KodiJsonRpcResponse<string>>('/jsonrpc', request)
      .pipe(
        map(response => {
          if (response.error) {
            throw new Error(`Failed to swap playlist items: ${response.error.message}`);
          }
          return response.result || 'OK';
        })
      );
  }

  /**
   * Get current playlist properties (position, repeat, shuffle)
   */
  getPlaylistProperties(): Observable<any> {
    const request: KodiJsonRpcRequest = {
      jsonrpc: '2.0',
      method: 'Playlist.GetProperties',
      params: {
        playlistid: 0,
        properties: ['type', 'size']
      },
      id: this.getNextId()
    };

    return this.baseApiService.post<KodiJsonRpcResponse<any>>('/jsonrpc', request)
      .pipe(
        map(response => {
          if (response.error) {
            throw new Error(`Failed to get playlist properties: ${response.error.message}`);
          }
          return response.result || {};
        })
      );
  }

  private getNextId(): number {
    return this.requestId++;
  }
}