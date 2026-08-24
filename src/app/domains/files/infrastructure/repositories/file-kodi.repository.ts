// ==========================================================================
// INFRASTRUCTURE - File Kodi Repository Implementation
// ==========================================================================

import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { FileRepository } from '../../domain/repositories/file.repository';
import {
  FileItem,
  FileItemFactory,
  FileMedia,
  KodiFileResponse
} from '../../domain/entities/file-item.entity';
import { KodiRpcService } from '@shared/services/kodi-rpc.service';
import { KodiConfigService } from '@shared/services/kodi-config.service';
import { Methods } from '@shared/enums/methods';

interface KodiSourcesResult {
  sources?: KodiFileResponse[];
}

interface KodiDirectoryResult {
  files?: KodiFileResponse[];
}

interface KodiPrepareDownloadResult {
  protocol?: string;
  mode?: string;
  details?: { path?: string };
}

@Injectable({
  providedIn: 'root'
})
export class FileKodiRepository extends FileRepository {
  private readonly rpc = inject(KodiRpcService);
  /** Solo para componer la URL de descarga, no para hablar JSON-RPC. */
  private readonly config = inject(KodiConfigService);

  getSources(media: FileMedia): Observable<FileItem[]> {
    return this.send<KodiSourcesResult>(Methods.FilesGetSources, { media }).pipe(
      map(result => FileItemFactory.fromKodiResponseList(result.sources ?? []))
    );
  }

  getDirectory(path: string, media: FileMedia): Observable<FileItem[]> {
    return this.send<KodiDirectoryResult>(Methods.FilesGetDirectory, {
      directory: path,
      media,
      properties: ['mimetype'],
      sort: { order: 'ascending', method: 'label' }
    }).pipe(
      map(result => FileItemFactory.fromKodiResponseList(result.files ?? []))
    );
  }

  getDownloadUrl(path: string): Observable<string> {
    return this.send<KodiPrepareDownloadResult>(Methods.FilesPrepareDownload, { path }).pipe(
      map(result => {
        const relative = result.details?.path;

        // En modo redirect la ruta ya es absoluta y la sirve otro protocolo.
        if (!relative) {
          throw new Error('Kodi no ha devuelto una ruta de descarga para el archivo');
        }

        return relative.startsWith('http')
          ? relative
          : `${this.config.httpBaseUrl}/${relative.replace(/^\//, '')}`;
      })
    );
  }

  private send<T>(method: Methods, params: Record<string, unknown>): Observable<T> {
    return this.rpc.query<T>(method, params);
  }
}
