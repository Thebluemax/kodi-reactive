// ==========================================================================
// INFRASTRUCTURE - Input Kodi Repository Implementation
// ==========================================================================

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { InputRepository } from '../../domain/repositories/input.repository';
import { InputAction } from '../../domain/entities/input-action.entity';
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
export class InputKodiRepository extends InputRepository {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.serverApiUrl}:${environment.apiPort}/mediaplayer`;
  private requestId = 1;

  // ========================================================================
  // Navigation
  // ========================================================================

  navigateUp(): Observable<void> {
    return this.executeInputAction(InputAction.Up);
  }

  navigateDown(): Observable<void> {
    return this.executeInputAction(InputAction.Down);
  }

  navigateLeft(): Observable<void> {
    return this.executeInputAction(InputAction.Left);
  }

  navigateRight(): Observable<void> {
    return this.executeInputAction(InputAction.Right);
  }

  // ========================================================================
  // Actions
  // ========================================================================

  select(): Observable<void> {
    return this.executeInputAction(InputAction.Select);
  }

  back(): Observable<void> {
    return this.executeInputAction(InputAction.Back);
  }

  goHome(): Observable<void> {
    return this.executeInputAction(InputAction.Home);
  }

  contextMenu(): Observable<void> {
    return this.executeInputAction(InputAction.ContextMenu);
  }

  showInfo(): Observable<void> {
    return this.executeInputAction(InputAction.Info);
  }

  // ========================================================================
  // Private Helpers
  // ========================================================================

  private executeInputAction(action: InputAction): Observable<void> {
    const request = this.buildRequest(action);
    return this.executeCommand(request);
  }

  private buildRequest(method: string, params?: unknown[] | Record<string, unknown>): KodiJsonRpcRequest {
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
