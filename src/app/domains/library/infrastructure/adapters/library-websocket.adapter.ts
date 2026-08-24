// ==========================================================================
// INFRASTRUCTURE - Library WebSocket Adapter
// ==========================================================================
// Abre su propia conexión WebSocket con Kodi (Kodi acepta varios clientes)
// y traduce las notificaciones AudioLibrary.On* / VideoLibrary.On* a eventos
// de dominio. No hace polling: solo escucha.
// ==========================================================================

import { Injectable, OnDestroy, inject } from '@angular/core';
import { BehaviorSubject, Observable, Subject , Subscription } from 'rxjs';

import { KodiSocketService } from '@shared/services/kodi-socket.service';
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
  private readonly socket = inject(KodiSocketService);

  private subscription: Subscription | null = null;
  private connectionSubscription: Subscription | null = null;

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
    if (this.subscription) {
      return;
    }

    // El socket es compartido y reconecta solo: aqui solo se escucha.
    this.subscription = this.socket.messages$.subscribe(message =>
      this.processNotification(message as KodiJsonRpcNotification)
    );

    this.connectionSubscription = this.socket.connected$.subscribe(connected =>
      this.connectionSubject.next(connected)
    );

    this.socket.acquire();
  }

  /**
   * Cierra la conexión con Kodi.
   */
  disconnect(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = null;
      this.connectionSubscription?.unsubscribe();
      this.connectionSubscription = null;
      this.socket.release();
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

  /** El parseo lo hace ya el socket compartido: aqui solo se reparte. */
  private processNotification(
    data: KodiJsonRpcNotification | KodiJsonRpcNotification[]
  ): void {
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
