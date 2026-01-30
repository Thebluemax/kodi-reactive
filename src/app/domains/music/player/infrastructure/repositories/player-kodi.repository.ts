// ==========================================================================
// INFRASTRUCTURE - Player Kodi Repository Implementation
// ==========================================================================

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { PlayerRepository } from '../../domain/repositories/player.repository';
import { environment } from 'src/environments/environment';

interface KodiJsonRpcRequest {
  jsonrpc: '2.0';
  method: string;
  params?: Record<string, unknown> | unknown[];
  id: number;
}

@Injectable({
  providedIn: 'root'
})
export class PlayerKodiRepository extends PlayerRepository {
  private readonly http = inject(HttpClient);
  // Use proxy (serverApiUrl) to avoid CORS issues
  private readonly apiUrl = `${environment.serverApiUrl}:${environment.apiPort}/mediaplayer`;
  private requestId = 1;

  // ========================================================================
  // Playback Control
  // ========================================================================

  playPause(): Observable<void> {
    const request = this.buildRequest('Player.PlayPause', [0, 'toggle']);
    return this.executeCommand(request);
  }

  stop(): Observable<void> {
    const request = this.buildRequest('Player.Stop', [0]);
    return this.executeCommand(request);
  }

  nextTrack(): Observable<void> {
    const request = this.buildRequest('Player.GoTo', [0, 'next']);
    return this.executeCommand(request);
  }

  previousTrack(): Observable<void> {
    const request = this.buildRequest('Player.GoTo', [0, 'previous']);
    return this.executeCommand(request);
  }

  seek(percentage: number): Observable<void> {
    const request = this.buildRequest('Player.Seek', [0, { percentage }]);
    return this.executeCommand(request);
  }

  // ========================================================================
  // Playback Modes
  // ========================================================================

  toggleShuffle(): Observable<void> {
    const request = this.buildRequest('Player.SetShuffle', [0, 'toggle']);
    return this.executeCommand(request);
  }

  cycleRepeat(): Observable<void> {
    const request = this.buildRequest('Player.SetRepeat', [0, 'cycle']);
    return this.executeCommand(request);
  }

  togglePartyMode(): Observable<void> {
    const request = this.buildRequest('Player.SetPartymode', [0, 'toggle']);
    return this.executeCommand(request);
  }

  // ========================================================================
  // Volume Control
  // ========================================================================

  setVolume(level: number): Observable<void> {
    const clampedLevel = Math.max(0, Math.min(100, Math.round(level)));
    const request = this.buildRequest('Application.SetVolume', [clampedLevel]);
    return this.executeCommand(request);
  }

  toggleMute(): Observable<void> {
    const request = this.buildRequest('Application.SetMute', ['toggle']);
    return this.executeCommand(request);
  }

  // ========================================================================
  // Private Helpers
  // ========================================================================

  private buildRequest(method: string, params: unknown[] | Record<string, unknown>): KodiJsonRpcRequest {
    return {
      jsonrpc: '2.0',
      method,
      params,
      id: this.getNextId()
    };
  }

  private executeCommand(request: KodiJsonRpcRequest): Observable<void> {
    return this.http.post<unknown>(this.apiUrl, request).pipe(
      map(() => void 0)
    );
  }

  private getNextId(): number {
    return this.requestId++;
  }
}
