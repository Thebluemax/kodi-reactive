// ==========================================================================
// SHARED - Kodi Connection Config Service
// ==========================================================================
// Production  : auto-discovers protocol, host and HTTP port from window.location
//               (works when the app is served as a Kodi add-on).
// Development : falls back to environment values.
// WS port     : always read from localStorage (configurable at runtime).
// ==========================================================================

import { Injectable, signal, computed } from '@angular/core';
import { environment } from 'src/environments/environment';

const STORAGE_KEY = 'kodi-ws-port';

@Injectable({ providedIn: 'root' })
export class KodiConfigService {
  // ── Static values resolved once at startup ──────────────────────────────
  readonly protocol: string;
  readonly host: string;
  readonly httpPort: number;
  readonly httpBaseUrl: string;

  // ── Configurable (persisted in localStorage) ─────────────────────────────
  readonly wsPort = signal<number>(this.loadWsPort());

  // ── Computed ──────────────────────────────────────────────────────────────
  readonly wsUrl = computed(
    () => `ws://${this.host}:${this.wsPort()}/jsonrpc`
  );

  constructor() {
    if (environment.production) {
      this.protocol = window.location.protocol;
      this.host = window.location.hostname;
      this.httpPort = window.location.port
        ? parseInt(window.location.port, 10)
        : 80;
    } else {
      this.protocol = 'http:';
      this.host = environment.socketServer;
      this.httpPort = environment.kodiHttpPort;
    }

    this.httpBaseUrl = `${this.protocol}//${this.host}:${this.httpPort}`;
  }

  setWsPort(port: number): void {
    this.wsPort.set(port);
    localStorage.setItem(STORAGE_KEY, String(port));
  }

  private loadWsPort(): number {
    const stored = parseInt(localStorage.getItem(STORAGE_KEY) ?? '', 10);
    return isNaN(stored) ? environment.socketPort : stored;
  }
}
