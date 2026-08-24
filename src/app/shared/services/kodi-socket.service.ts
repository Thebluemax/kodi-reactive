// ==========================================================================
// SHARED - Kodi WebSocket
// ==========================================================================
// Conexion unica con Kodi, compartida por todo lo que necesite escucharle.
//
// Antes habia dos: una para el reproductor, viva mientras la aplicacion
// estuviera abierta, y otra para la biblioteca, que solo se conectaba mientras
// Ajustes estaba a la vista. Ninguna reconectaba: si Kodi se reiniciaba o la
// red parpadeaba, el reproductor dejaba de actualizarse hasta recargar la
// pagina, y sin nada en la interfaz que lo dijera.
// ==========================================================================

import { Injectable, OnDestroy, inject, signal } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

import { KodiConfigService } from './kodi-config.service';

/** Espera entre reintentos, en milisegundos. */
const RETRY_DELAYS = [1000, 2000, 5000, 10000, 30000] as const;

@Injectable({
  providedIn: 'root'
})
export class KodiSocketService implements OnDestroy {
  private readonly config = inject(KodiConfigService);

  private socket: WebSocket | null = null;
  private retryTimer: ReturnType<typeof setTimeout> | null = null;
  private retryIndex = 0;
  /** Cuantos han pedido la conexion: se cierra cuando no queda ninguno. */
  private users = 0;

  private readonly messageSubject = new Subject<unknown>();
  private readonly connectedSubject = new BehaviorSubject<boolean>(false);

  readonly isConnected = signal<boolean>(false);
  /** `true` mientras se espera para reintentar, para poder decirlo. */
  readonly isReconnecting = signal<boolean>(false);

  ngOnDestroy(): void {
    this.users = 0;
    this.teardown();
  }

  /** Mensajes que llegan de Kodi, ya parseados. */
  get messages$(): Observable<unknown> {
    return this.messageSubject.asObservable();
  }

  /**
   * Estado de la conexion como flujo, ademas de como signal: los adaptadores
   * viven fuera de un contexto de inyeccion cuando conectan, y un effect ahi
   * no vale.
   */
  get connected$(): Observable<boolean> {
    return this.connectedSubject.asObservable();
  }

  /**
   * Pide la conexion. Es idempotente y lleva la cuenta de quien la usa, para
   * que el ultimo en soltarla sea quien la cierre.
   */
  acquire(): void {
    this.users++;
    this.open();
  }

  release(): void {
    this.users = Math.max(0, this.users - 1);

    if (this.users === 0) {
      this.teardown();
    }
  }

  /** Envia por el socket, si esta abierto. */
  send(payload: unknown): boolean {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      return false;
    }

    this.socket.send(JSON.stringify(payload));
    return true;
  }

  private open(): void {
    if (this.socket && this.socket.readyState !== WebSocket.CLOSED) {
      return;
    }

    this.clearRetry();
    this.socket = new WebSocket(this.config.wsUrl());

    this.socket.onopen = () => {
      this.retryIndex = 0;
      this.isReconnecting.set(false);
      this.isConnected.set(true);
      this.connectedSubject.next(true);
    };

    this.socket.onmessage = event => {
      try {
        this.messageSubject.next(JSON.parse(event.data as string));
      } catch {
        // Un mensaje ilegible no puede tumbar el flujo: Kodi sigue enviando.
      }
    };

    // `onerror` no dice nada util y siempre va seguido de `onclose`, que es
    // donde se decide el reintento.
    this.socket.onclose = () => {
      this.setDisconnected();
      this.socket = null;

      if (this.users > 0) {
        this.scheduleRetry();
      }
    };
  }

  /**
   * Reintenta espaciando cada vez mas, hasta un tope.
   *
   * Sin el tope, un Kodi apagado durante horas recibiria una peticion por
   * segundo para nada; sin el escalado, un corte de un instante tardaria de
   * mas en recuperarse.
   */
  private scheduleRetry(): void {
    if (this.retryTimer) {
      return;
    }

    const delay = RETRY_DELAYS[Math.min(this.retryIndex, RETRY_DELAYS.length - 1)];
    this.retryIndex++;
    this.isReconnecting.set(true);

    this.retryTimer = setTimeout(() => {
      this.retryTimer = null;
      this.open();
    }, delay);
  }

  private clearRetry(): void {
    if (this.retryTimer) {
      clearTimeout(this.retryTimer);
      this.retryTimer = null;
    }

    this.isReconnecting.set(false);
  }

  private teardown(): void {
    this.clearRetry();
    this.retryIndex = 0;

    if (this.socket) {
      // Se quita el handler antes de cerrar: este cierre es a proposito y no
      // debe disparar un reintento.
      this.socket.onclose = null;
      this.socket.close();
      this.socket = null;
    }

    this.setDisconnected();
  }

  private setDisconnected(): void {
    this.isConnected.set(false);
    this.connectedSubject.next(false);
  }
}
