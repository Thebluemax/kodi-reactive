// ==========================================================================
// APPLICATION USE CASE - Browse Files
// ==========================================================================

import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { FileRepository } from '../../domain/repositories/file.repository';
import { FileItem, FileMedia } from '../../domain/entities/file-item.entity';

@Injectable({
  providedIn: 'root'
})
export class BrowseFilesUseCase {
  private readonly fileRepository = inject(FileRepository);

  /** Fuentes configuradas en Kodi, el punto de partida de la navegacion. */
  sources(media: FileMedia): Observable<FileItem[]> {
    return this.fileRepository.getSources(media);
  }

  directory(path: string, media: FileMedia): Observable<FileItem[]> {
    return this.fileRepository.getDirectory(path, media);
  }

  /** URL servida por Kodi desde la que previsualizar un archivo. */
  downloadUrl(path: string): Observable<string> {
    return this.fileRepository.getDownloadUrl(path);
  }
}
