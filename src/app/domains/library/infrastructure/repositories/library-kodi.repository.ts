// ==========================================================================
// INFRASTRUCTURE - Library Kodi Repository Implementation
// ==========================================================================

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import { LibraryRepository } from '../../domain/repositories/library.repository';
import { LibraryType } from '../../domain/entities/library-type.entity';
import { KodiConfigService } from '@shared/services/kodi-config.service';
import { Methods } from '@shared/enums/methods';

interface KodiJsonRpcRequest {
  jsonrpc: '2.0';
  method: string;
  id: number;
}

interface KodiJsonRpcResponse {
  id: number;
  result?: unknown;
  error?: {
    code: number;
    message: string;
  };
}

const SCAN_METHODS: Record<LibraryType, Methods> = {
  [LibraryType.Audio]: Methods.AudioLibraryScan,
  [LibraryType.Video]: Methods.VideoLibraryScan
};

const CLEAN_METHODS: Record<LibraryType, Methods> = {
  [LibraryType.Audio]: Methods.AudioLibraryClean,
  [LibraryType.Video]: Methods.VideoLibraryClean
};

@Injectable({
  providedIn: 'root'
})
export class LibraryKodiRepository extends LibraryRepository {
  private readonly http = inject(HttpClient);
  private readonly config = inject(KodiConfigService);
  private requestId = 1;

  scan(type: LibraryType): Observable<void> {
    return this.executeCommand(SCAN_METHODS[type]);
  }

  clean(type: LibraryType): Observable<void> {
    return this.executeCommand(CLEAN_METHODS[type]);
  }

  // ========================================================================
  // Private Helpers
  // ========================================================================

  private executeCommand(method: Methods): Observable<void> {
    const request: KodiJsonRpcRequest = {
      jsonrpc: '2.0',
      method,
      id: this.getNextId()
    };

    return this.http.post<KodiJsonRpcResponse>(this.config.jsonRpcUrl, request).pipe(
      // Kodi devuelve HTTP 200 aunque el JSON-RPC falle: el error viaja en el body
      switchMap(response =>
        response.error
          ? throwError(() => new Error(`Kodi ${method}: ${response.error!.message}`))
          : [response]
      ),
      map(() => void 0)
    );
  }

  private getNextId(): number {
    return this.requestId++;
  }
}
