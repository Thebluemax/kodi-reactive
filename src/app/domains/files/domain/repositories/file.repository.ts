// ==========================================================================
// DOMAIN REPOSITORY - File (Interface/Contract)
// ==========================================================================

import { Observable } from 'rxjs';
import { FileItem, FileMedia } from '../entities/file-item.entity';

export abstract class FileRepository {
  /** Fuentes configuradas en Kodi para esa ventana de medios. */
  abstract getSources(media: FileMedia): Observable<FileItem[]>;

  /** Contenido de una carpeta, carpetas y archivos mezclados. */
  abstract getDirectory(path: string, media: FileMedia): Observable<FileItem[]>;

  /**
   * URL absoluta desde la que el navegador puede leer el archivo, servida por
   * el propio servidor web de Kodi.
   */
  abstract getDownloadUrl(path: string): Observable<string>;
}
