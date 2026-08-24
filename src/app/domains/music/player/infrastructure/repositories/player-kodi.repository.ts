// ==========================================================================
// INFRASTRUCTURE - Player Kodi Repository Implementation
// ==========================================================================

import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { PlayerRepository } from '../../domain/repositories/player.repository';
import { PlayerWebSocketAdapter } from '../adapters/player-websocket.adapter';
import { KodiRpcService } from '@shared/services/kodi-rpc.service';

@Injectable({
  providedIn: 'root'
})
export class PlayerKodiRepository extends PlayerRepository {
  private readonly rpc = inject(KodiRpcService);
  private readonly wsAdapter = inject(PlayerWebSocketAdapter);

  private get playerId(): number {
    return this.wsAdapter.activePlayerId;
  }

  // ========================================================================
  // Playback Control
  // ========================================================================

  playPause(): Observable<void> {
    return this.rpc.command('Player.PlayPause', [this.playerId, 'toggle']);
  }

  stop(): Observable<void> {
    return this.rpc.command('Player.Stop', [this.playerId]);
  }

  nextTrack(): Observable<void> {
    return this.rpc.command('Player.GoTo', [this.playerId, 'next']);
  }

  previousTrack(): Observable<void> {
    return this.rpc.command('Player.GoTo', [this.playerId, 'previous']);
  }

  seek(percentage: number): Observable<void> {
    return this.rpc.command('Player.Seek', [this.playerId, { percentage }]);
  }

  // ========================================================================
  // Playback Modes
  // ========================================================================

  toggleShuffle(): Observable<void> {
    return this.rpc.command('Player.SetShuffle', [this.playerId, 'toggle']);
  }

  cycleRepeat(): Observable<void> {
    return this.rpc.command('Player.SetRepeat', [this.playerId, 'cycle']);
  }

  togglePartyMode(): Observable<void> {
    return this.rpc.command('Player.SetPartymode', [this.playerId, 'toggle']);
  }

  // ========================================================================
  // Volume Control
  // ========================================================================

  setVolume(level: number): Observable<void> {
    const clampedLevel = Math.max(0, Math.min(100, Math.round(level)));
    return this.rpc.command('Application.SetVolume', [clampedLevel]);
  }

  toggleMute(): Observable<void> {
    return this.rpc.command('Application.SetMute', ['toggle']);
  }

}
