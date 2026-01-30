// ==========================================================================
// INFRASTRUCTURE - Track Kodi Repository Implementation
// ==========================================================================

import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

import { TrackRepository } from '../../domain/repositories/track.repository';
import { environment } from 'src/environments/environment';

// TODO: Move to core/infrastructure/config
const KODI_API_URL = `${environment.serverApiUrl}:${environment.apiPort}/jsonrpc`;

interface KodiJsonRpcRequest {
  jsonrpc: '2.0';
  method: string;
  params?: Record<string, unknown>;
  id: number;
}

@Injectable({
  providedIn: 'root'
})
export class TrackKodiRepository extends TrackRepository {
  private readonly http = inject(HttpClient);
  private requestId = 1;

  addToPlaylist(trackId: number, playImmediately: boolean): Observable<void> {
    const request: KodiJsonRpcRequest = {
      jsonrpc: '2.0',
      method: playImmediately ? 'Player.Open' : 'Playlist.Add',
      params: playImmediately
        ? { item: { songid: trackId } }
        : { playlistid: 0, item: { songid: trackId } },
      id: this.getNextId()
    };

    return this.http.post<unknown>(KODI_API_URL, request).pipe(
      map(() => void 0)
    );
  }

  playTrack(trackId: number): Observable<void> {
    const request: KodiJsonRpcRequest = {
      jsonrpc: '2.0',
      method: 'Player.Open',
      params: { item: { songid: trackId } },
      id: this.getNextId()
    };

    return this.http.post<unknown>(KODI_API_URL, request).pipe(
      map(() => void 0)
    );
  }

  private getNextId(): number {
    return this.requestId++;
  }
}