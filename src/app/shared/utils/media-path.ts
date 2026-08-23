// ==========================================================================
// SHARED - Media Path Helpers
// ==========================================================================
// Kodi devuelve rutas de origenes muy distintos —smb://, nfs://, /home/...,
// C:\...— asi que los separadores se tratan de forma indistinta.
// ==========================================================================

const SEPARATORS = /[/\\]/;

/** Ultimo tramo de una ruta, ignorando la barra final de las carpetas. */
export function fileName(path: string): string {
  const trimmed = path.replace(/[/\\]+$/, '');
  const separator = Math.max(trimmed.lastIndexOf('/'), trimmed.lastIndexOf('\\'));

  return separator >= 0 ? trimmed.slice(separator + 1) : trimmed;
}

/** Carpeta que contiene la ruta, con su separador final. */
export function folderOf(path: string): string {
  const separator = Math.max(path.lastIndexOf('/'), path.lastIndexOf('\\'));

  return separator >= 0 ? path.slice(0, separator + 1) : '';
}

/**
 * Carpeta comun a todas las rutas, o cadena vacia si no la hay.
 *
 * Album y artista no tienen `file` en la API de Kodi, asi que su carpeta solo
 * puede deducirse de la de sus pistas. Devolver vacio cuando estan repartidas
 * evita presentar como cierta una ruta que solo vale para parte del album.
 */
export function commonFolder(paths: readonly string[]): string {
  const folders = paths.filter(path => path.length > 0).map(folderOf);

  if (folders.length === 0) {
    return '';
  }

  const [first, ...rest] = folders;

  return rest.every(folder => folder === first) ? first : '';
}

/** `true` si las rutas existen pero no comparten carpeta. */
export function isSpreadAcrossFolders(paths: readonly string[]): boolean {
  const withPath = paths.filter(path => path.length > 0);

  return withPath.length > 1 && commonFolder(withPath) === '';
}

/** Evita que el separador quede pegado a la palabra al partir la linea. */
export const PATH_SEPARATORS = SEPARATORS;
