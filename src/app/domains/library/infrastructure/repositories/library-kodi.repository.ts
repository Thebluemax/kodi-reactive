// ==========================================================================
// INFRASTRUCTURE - Library Kodi Repository Implementation
// ==========================================================================

import { Injectable, inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import { LibraryRepository } from '../../domain/repositories/library.repository';
import { LibraryType } from '../../domain/entities/library-type.entity';
import { KodiRpcService } from '@shared/services/kodi-rpc.service';
import { Methods } from '@shared/enums/methods';

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
  private readonly rpc = inject(KodiRpcService);

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
    return this.rpc.command(method);
  }
}
