// ==========================================================================
// DOMAIN REPOSITORY - Library (Interface/Contract)
// ==========================================================================

import { Observable } from 'rxjs';
import { LibraryType } from '../entities/library-type.entity';

/**
 * Library Repository Interface
 * Define el contrato para las tareas de mantenimiento de la biblioteca
 * Las implementaciones pueden ser Kodi API, Mock, etc.
 */
export abstract class LibraryRepository {
  /**
   * Lanza un escaneo de la biblioteca en busca de contenido nuevo.
   * Kodi responde de inmediato: el progreso llega por notificaciones.
   */
  abstract scan(type: LibraryType): Observable<void>;

  /**
   * Lanza una limpieza de la biblioteca.
   * Elimina de la base de datos los items cuyo archivo ya no existe.
   */
  abstract clean(type: LibraryType): Observable<void>;
}
