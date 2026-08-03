// ==========================================================================
// APPLICATION FACADE - Library
// ==========================================================================
// Coordina los casos de uso (disparo por JSON-RPC) con el adapter WebSocket
// (progreso real). El estado de cada operación vive aquí como signal.
// ==========================================================================

import { Injectable, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable } from 'rxjs';

import { ScanLibraryUseCase } from './use-cases/scan-library.use-case';
import { CleanLibraryUseCase } from './use-cases/clean-library.use-case';
import { LibraryWebSocketAdapter } from '../infrastructure/adapters/library-websocket.adapter';
import { LibraryType, LibraryOperation } from '../domain/entities/library-type.entity';
import { LibraryEvent, LibraryEventPhase } from '../domain/entities/library-event.entity';

/**
 * Si Kodi nunca envía la notificación de fin (conexión caída, escaneo
 * abortado), liberamos el estado para no dejar el spinner colgado.
 */
const SAFETY_TIMEOUT_MS = 10 * 60 * 1000;

@Injectable({
  providedIn: 'root'
})
export class LibraryFacade {
  private readonly scanUseCase = inject(ScanLibraryUseCase);
  private readonly cleanUseCase = inject(CleanLibraryUseCase);
  private readonly webSocket = inject(LibraryWebSocketAdapter);
  private readonly destroyRef = inject(DestroyRef);

  private readonly running = signal<ReadonlySet<string>>(new Set<string>());
  private readonly safetyTimers = new Map<string, ReturnType<typeof setTimeout>>();

  /** Último error, para mostrarlo en la UI */
  readonly lastError = signal<string | null>(null);

  /** Última operación finalizada, para confirmar en la UI */
  readonly lastFinished = signal<LibraryEvent | null>(null);

  constructor() {
    this.webSocket
      .getEventStream()
      .pipe(takeUntilDestroyed())
      .subscribe(event => this.handleEvent(event));

    this.webSocket
      .getErrorStream()
      .pipe(takeUntilDestroyed())
      .subscribe(error => this.lastError.set(error.message));

    this.destroyRef.onDestroy(() => this.clearAllTimers());
  }

  // ========================================================================
  // Conexión
  // ========================================================================

  connect(): void {
    this.webSocket.connect();
  }

  disconnect(): void {
    this.webSocket.disconnect();
  }

  // ========================================================================
  // Comandos
  // ========================================================================

  scan(type: LibraryType): void {
    this.execute(type, LibraryOperation.Scan, this.scanUseCase.execute(type));
  }

  clean(type: LibraryType): void {
    this.execute(type, LibraryOperation.Clean, this.cleanUseCase.execute(type));
  }

  // ========================================================================
  // Estado
  // ========================================================================

  isRunning(type: LibraryType, operation: LibraryOperation): boolean {
    return this.running().has(this.buildKey(type, operation));
  }

  /** True si hay cualquier operación en curso sobre esa biblioteca */
  isBusy(type: LibraryType): boolean {
    return (
      this.isRunning(type, LibraryOperation.Scan) ||
      this.isRunning(type, LibraryOperation.Clean)
    );
  }

  clearError(): void {
    this.lastError.set(null);
  }

  clearFinished(): void {
    this.lastFinished.set(null);
  }

  // ========================================================================
  // Privados
  // ========================================================================

  private execute(
    type: LibraryType,
    operation: LibraryOperation,
    request$: Observable<void>
  ): void {
    if (this.isRunning(type, operation)) {
      return;
    }

    // Optimista: Kodi responde al instante y el progreso llega por WebSocket,
    // pero la notificación OnScanStarted puede tardar en llegar.
    this.markRunning(type, operation);

    request$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      error: (error: Error) => {
        this.markFinished(type, operation);
        this.lastError.set(error.message);
      }
    });
  }

  private handleEvent(event: LibraryEvent): void {
    if (event.phase === LibraryEventPhase.Started) {
      this.markRunning(event.type, event.operation);
      return;
    }

    this.markFinished(event.type, event.operation);
    this.lastFinished.set(event);
  }

  private markRunning(type: LibraryType, operation: LibraryOperation): void {
    const key = this.buildKey(type, operation);

    this.running.update(current => new Set(current).add(key));
    this.resetSafetyTimer(key, type, operation);
  }

  private markFinished(type: LibraryType, operation: LibraryOperation): void {
    const key = this.buildKey(type, operation);

    this.running.update(current => {
      const next = new Set(current);
      next.delete(key);
      return next;
    });

    this.clearTimer(key);
  }

  private resetSafetyTimer(
    key: string,
    type: LibraryType,
    operation: LibraryOperation
  ): void {
    this.clearTimer(key);

    this.safetyTimers.set(
      key,
      setTimeout(() => this.markFinished(type, operation), SAFETY_TIMEOUT_MS)
    );
  }

  private clearTimer(key: string): void {
    const timer = this.safetyTimers.get(key);

    if (timer) {
      clearTimeout(timer);
      this.safetyTimers.delete(key);
    }
  }

  private clearAllTimers(): void {
    this.safetyTimers.forEach(timer => clearTimeout(timer));
    this.safetyTimers.clear();
  }

  private buildKey(type: LibraryType, operation: LibraryOperation): string {
    return `${type}:${operation}`;
  }
}
