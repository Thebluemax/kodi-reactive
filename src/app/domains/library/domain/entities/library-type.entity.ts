// ==========================================================================
// DOMAIN ENTITY - Library Type
// ==========================================================================

/**
 * Bibliotecas de Kodi sobre las que se pueden ejecutar tareas de mantenimiento
 */
export enum LibraryType {
  Audio = 'audio',
  Video = 'video'
}

/**
 * Operaciones de mantenimiento disponibles
 * - Scan  : busca contenido nuevo en las fuentes configuradas
 * - Clean : elimina de la base de datos los items cuyo archivo ya no existe
 */
export enum LibraryOperation {
  Scan = 'scan',
  Clean = 'clean'
}
