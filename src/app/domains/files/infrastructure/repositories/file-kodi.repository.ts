// ==========================================================================
// INFRASTRUCTURE - File Kodi Repository Implementation
// ==========================================================================

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { FileRepository } from '../../domain/repositories/file.repository';
import {
  FileItem,
  FileItemFactory,
  FileMedia,
  KodiFileResponse
} from '../../domain/entities/file-item.entity';
import { KodiConfigService } from '@shared/services/kodi-config.service';
import { Methods } from '@shared/enums/methods';
import { environment } from 'src/environments/environment';

interface KodiJsonRpcRequest {
  jsonrpc: string;
  method: string;
  params?: Record<string, unknown>;
  id: number;
}

interface KodiJsonRpcEnvelope<T> {
  result?: T;
  error?: {
    code: number;
    message: string;
  };
}

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
  private readonly http = inject(HttpClient);
  private readonly config = inject(KodiConfigService);
  private requestId = 1;

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
    const request: KodiJsonRpcRequest = {
      jsonrpc: environment.jsonrpcVersion,
      method,
      params,
      id: this.requestId++
    };

    return this.http.post<KodiJsonRpcEnvelope<T>>(this.config.jsonRpcUrl, request).pipe(
      map(response => {
        if (response.error) {
          throw new Error(
            `Kodi rechazo la peticion: ${response.error.message} (codigo ${response.error.code})`
          );
        }

        return (response.result ?? {}) as T;
      })
    );
  }
}
