// ==========================================================================
// INFRASTRUCTURE - Library WebSocket Adapter
// ==========================================================================
// Abre su propia conexión WebSocket con Kodi (Kodi acepta varios clientes)
// y traduce las notificaciones AudioLibrary.On* / VideoLibrary.On* a eventos
// de dominio. No hace polling: solo escucha.
// ==========================================================================

import { Injectable, OnDestroy, inject } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

import { KodiConfigService } from '@shared/services/kodi-config.service';
import { Methods } from '@shared/enums/methods';
import { LibraryType, LibraryOperation } from '../../domain/entities/library-type.entity';
import {
  LibraryEvent,
  LibraryEventFactory,
  LibraryEventPhase
} from '../../domain/entities/library-event.entity';

interface KodiJsonRpcNotification {
  method?: string;
  params?: unknown;
}

/** Notificación de Kodi -> evento de dominio */
const NOTIFICATION_MAP: Record<
  string,
  { type: LibraryType; operation: LibraryOperation; phase: LibraryEventPhase }
> = {
  [Methods.AudioLibraryOnScanStarted]: {
    type: LibraryType.Audio,
    operation: LibraryOperation.Scan,
    phase: LibraryEventPhase.Started
  },
  [Methods.AudioLibraryOnScanFinished]: {
    type: LibraryType.Audio,
    operation: LibraryOperation.Scan,
    phase: LibraryEventPhase.Finished
  },
  [Methods.AudioLibraryOnCleanStarted]: {
    type: LibraryType.Audio,
    operation: LibraryOperation.Clean,
    phase: LibraryEventPhase.Started
  },
  [Methods.AudioLibraryOnCleanFinished]: {
    type: LibraryType.Audio,
    operation: LibraryOperation.Clean,
    phase: LibraryEventPhase.Finished
  },
  [Methods.VideoLibraryOnScanStarted]: {
    type: LibraryType.Video,
    operation: LibraryOperation.Scan,
    phase: LibraryEventPhase.Started
  },
  [Methods.VideoLibraryOnScanFinished]: {
    type: LibraryType.Video,
    operation: LibraryOperation.Scan,
    phase: LibraryEventPhase.Finished
  },
  [Methods.VideoLibraryOnCleanStarted]: {
    type: LibraryType.Video,
    operation: LibraryOperation.Clean,
    phase: LibraryEventPhase.Started
  },
  [Methods.VideoLibraryOnCleanFinished]: {
    type: LibraryType.Video,
    operation: LibraryOperation.Clean,
    phase: LibraryEventPhase.Finished
  }
};

@Injectable({
  providedIn: 'root'
})
export class LibraryWebSocketAdapter implements OnDestroy {
  private readonly kodiConfig = inject(KodiConfigService);

  private webSocket: WebSocket | null = null;

  private readonly eventSubject = new Subject<LibraryEvent>();
  private readonly connectionSubject = new BehaviorSubject<boolean>(false);
  private readonly errorSubject = new Subject<Error>();

  ngOnDestroy(): void {
    this.disconnect();
  }

  // ========================================================================
  // Public API
  // ========================================================================

  /**
   * Abre la conexión con Kodi. Idempotente.
   */
  connect(): void {
    if (
      this.webSocket &&
      (this.webSocket.readyState === WebSocket.OPEN ||
        this.webSocket.readyState === WebSocket.CONNECTING)
    ) {
      return;
    }

    this.webSocket = new WebSocket(this.kodiConfig.wsUrl());

    this.webSocket.onopen = () => this.connectionSubject.next(true);

    this.webSocket.onmessage = (event) => this.processMessage(event.data);

    this.webSocket.onerror = () =>
      this.errorSubject.next(new Error('Library WebSocket error'));

    this.webSocket.onclose = () => this.connectionSubject.next(false);
  }

  /**
   * Cierra la conexión con Kodi.
   */
  disconnect(): void {
    if (this.webSocket) {
      this.webSocket.close();
      this.webSocket = null;
    }

    this.connectionSubject.next(false);
  }

  /**
   * Stream de eventos de escaneo/limpieza
   */
  getEventStream(): Observable<LibraryEvent> {
    return this.eventSubject.asObservable();
  }

  /**
   * Estado de la conexión
   */
  getConnectionStream(): Observable<boolean> {
    return this.connectionSubject.asObservable();
  }

  /**
   * Errores de la conexión
   */
  getErrorStream(): Observable<Error> {
    return this.errorSubject.asObservable();
  }

  // ========================================================================
  // Private Methods
  // ========================================================================

  private processMessage(raw: string): void {
    let data: KodiJsonRpcNotification | KodiJsonRpcNotification[];

    try {
      data = JSON.parse(raw);
    } catch {
      this.errorSubject.next(new Error('Library WebSocket: mensaje no parseable'));
      return;
    }

    if (Array.isArray(data)) {
      data.forEach(notification => this.handleNotification(notification));
      return;
    }

    this.handleNotification(data);
  }

  private handleNotification(notification: KodiJsonRpcNotification): void {
    if (!notification.method) {
      return;
    }

    const mapped = NOTIFICATION_MAP[notification.method];

    if (!mapped) {
      return;
    }

    this.eventSubject.next(
      LibraryEventFactory.create(mapped.type, mapped.operation, mapped.phase)
    );
  }
}
