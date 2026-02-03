// ==========================================================================
// INFRASTRUCTURE - Player WebSocket Adapter
// ==========================================================================

import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { environment } from 'src/environments/environment';

import {
  PlayerState,
  PlayerStateFactory,
  KodiPlayerPropertiesResponse,
  KodiApplicationPropertiesResponse
} from '../../domain/entities/player-state.entity';
import {
  CurrentTrack,
  CurrentTrackFactory,
  KodiCurrentTrackResponse
} from '../../domain/entities/current-track.entity';

interface KodiJsonRpcRequest {
  jsonrpc: '2.0';
  method: string;
  params?: unknown[];
  id: number;
}

interface KodiJsonRpcResponse {
  id: number;
  result?: unknown;
  method?: string;
  params?: unknown;
}

@Injectable({
  providedIn: 'root'
})
export class PlayerWebSocketAdapter implements OnDestroy {
  private webSocket: WebSocket | null = null;
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private readonly pollingInterval = 1000; // 1 second

  private readonly stateSubject = new BehaviorSubject<PlayerState>(PlayerStateFactory.createEmpty());
  private readonly currentTrackSubject = new BehaviorSubject<CurrentTrack | null>(null);
  private readonly connectionSubject = new BehaviorSubject<boolean>(false);
  private readonly errorSubject = new Subject<Error>();
  private readonly playlistChangedSubject = new Subject<string>();

  private readonly wsUrl: string;

  // Request IDs for identifying responses
  private readonly PLAYER_PROPERTIES_ID = 67;
  private readonly PLAYER_ITEM_ID = 68;
  private readonly APP_PROPERTIES_ID = 69;
  private readonly ACTIVE_PLAYERS_ID = 70;

  private lastAppProps: KodiApplicationPropertiesResponse = { volume: 100, muted: false };
  private _activePlayerId = 0;

  /**
   * Current active player ID (0 = audio, 1 = video)
   */
  get activePlayerId(): number {
    return this._activePlayerId;
  }

  constructor() {
    // Build WebSocket URL from environment
    const serverHost = environment.socketServer; //environment.serverUrl.replace(/^https?:\/\//, '').replace(/:\d+$/, '');
    this.wsUrl = `ws://${environment.socketServer}:${environment.socketPort}/jsonrpc?kodi`;
  }

  ngOnDestroy(): void {
    this.disconnect();
  }

  // ========================================================================
  // Public API
  // ========================================================================

  /**
   * Connect to Kodi WebSocket and start polling
   */
  connect(): void {
    if (this.webSocket && this.webSocket.readyState === WebSocket.OPEN) {
      return; // Already connected
    }

    this.webSocket = new WebSocket(this.wsUrl);

    this.webSocket.onopen = () => {
      this.connectionSubject.next(true);
      this.startPolling();
    };

    this.webSocket.onmessage = (event) => {
      this.processMessage(JSON.parse(event.data));
    };

    this.webSocket.onerror = (event) => {
      this.errorSubject.next(new Error('WebSocket error'));
    };

    this.webSocket.onclose = () => {
      this.connectionSubject.next(false);
      this.stopPolling();
    };
  }

  /**
   * Disconnect from Kodi WebSocket
   */
  disconnect(): void {
    this.stopPolling();

    if (this.webSocket) {
      this.webSocket.close();
      this.webSocket = null;
    }

    this.connectionSubject.next(false);
  }

  /**
   * Get player state stream
   */
  getStateStream(): Observable<PlayerState> {
    return this.stateSubject.asObservable();
  }

  /**
   * Get current track stream
   */
  getCurrentTrackStream(): Observable<CurrentTrack | null> {
    return this.currentTrackSubject.asObservable();
  }

  /**
   * Get connection status stream
   */
  getConnectionStream(): Observable<boolean> {
    return this.connectionSubject.asObservable();
  }

  /**
   * Get error stream
   */
  getErrorStream(): Observable<Error> {
    return this.errorSubject.asObservable();
  }

  /**
   * Get playlist changed stream
   * Emits the event type: 'add', 'remove', 'clear'
   */
  getPlaylistChangedStream(): Observable<string> {
    return this.playlistChangedSubject.asObservable();
  }

  /**
   * Current state snapshot
   */
  get currentState(): PlayerState {
    return this.stateSubject.getValue();
  }

  /**
   * Current track snapshot
   */
  get currentTrack(): CurrentTrack | null {
    return this.currentTrackSubject.getValue();
  }

  // ========================================================================
  // Private Methods
  // ========================================================================

  private startPolling(): void {
    if (this.intervalId) return;

    // Initial request
    this.requestStatus();

    this.intervalId = setInterval(() => {
      this.requestStatus();
    }, this.pollingInterval);
  }

  private stopPolling(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  private requestStatus(): void {
    if (!this.webSocket || this.webSocket.readyState !== WebSocket.OPEN) {
      return;
    }

    const playerId = this._activePlayerId;

    const requests: KodiJsonRpcRequest[] = [
      {
        jsonrpc: '2.0',
        method: 'Player.GetActivePlayers',
        id: this.ACTIVE_PLAYERS_ID
      },
      {
        jsonrpc: '2.0',
        method: 'Player.GetProperties',
        params: [
          playerId,
          [
            'playlistid',
            'speed',
            'position',
            'totaltime',
            'time',
            'percentage',
            'shuffled',
            'repeat',
            'canrepeat',
            'canshuffle',
            'canseek',
            'partymode'
          ]
        ],
        id: this.PLAYER_PROPERTIES_ID
      },
      {
        jsonrpc: '2.0',
        method: 'Player.GetItem',
        params: [
          playerId,
          [
            'title',
            'thumbnail',
            'file',
            'artist',
            'genre',
            'year',
            'rating',
            'album',
            'track',
            'duration',
            'playcount',
            'dateadded',
            'artistid',
            'albumid',
            'fanart'
          ]
        ],
        id: this.PLAYER_ITEM_ID
      },
      {
        jsonrpc: '2.0',
        method: 'Application.GetProperties',
        params: [['volume', 'muted']],
        id: this.APP_PROPERTIES_ID
      }
    ];

    this.webSocket.send(JSON.stringify(requests));
  }

  private processMessage(data: KodiJsonRpcResponse | KodiJsonRpcResponse[]): void {
    if (Array.isArray(data)) {
      data.forEach(response => this.handleResponse(response));
    } else {
      this.handleResponse(data);
    }
  }

  private handleResponse(response: KodiJsonRpcResponse): void {
    // Handle Kodi notifications (events)
    if (response.method) {
      this.handleNotification(response.method, response.params);
      return;
    }

    // Handle query responses
    switch (response.id) {
      case this.ACTIVE_PLAYERS_ID:
        if (response.result && Array.isArray(response.result)) {
          const players = response.result as { playerid: number; type: string }[];
          if (players.length > 0) {
            this._activePlayerId = players[0].playerid;
          }
        }
        break;

      case this.APP_PROPERTIES_ID:
        if (response.result) {
          this.lastAppProps = response.result as KodiApplicationPropertiesResponse;
        }
        break;

      case this.PLAYER_PROPERTIES_ID:
        if (response.result) {
          const playerProps = response.result as KodiPlayerPropertiesResponse;
          const state = PlayerStateFactory.fromKodiResponse(playerProps, this.lastAppProps);
          this.stateSubject.next(state);
        }
        break;

      case this.PLAYER_ITEM_ID:
        if (response.result && (response.result as { item?: KodiCurrentTrackResponse }).item) {
          const item = (response.result as { item: KodiCurrentTrackResponse }).item;
          const track = CurrentTrackFactory.fromKodiResponse(item);
          this.currentTrackSubject.next(track);
        } else {
          this.currentTrackSubject.next(null);
        }
        break;
    }
  }

  private handleNotification(method: string, params: unknown): void {
    // Kodi sends notifications for various events
    // We can use these to trigger immediate updates instead of waiting for polling
    switch (method) {
      case 'Player.OnPlay':
      case 'Player.OnPause':
      case 'Player.OnStop':
      case 'Player.OnSeek':
      case 'Player.OnPropertyChanged':
        // Trigger immediate status request
        this.requestStatus();
        break;

      case 'Playlist.OnAdd':
        this.playlistChangedSubject.next('add');
        this.requestStatus();
        break;

      case 'Playlist.OnRemove':
        this.playlistChangedSubject.next('remove');
        this.requestStatus();
        break;

      case 'Playlist.OnClear':
        this.playlistChangedSubject.next('clear');
        this.requestStatus();
        break;
    }
  }
}
