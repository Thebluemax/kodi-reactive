// ==========================================================================
// SHARED - Paginated List Helpers
// ==========================================================================
// Las tres listas paginadas —peliculas, albumes y series— appendean cada
// pagina a la anterior y comparten las mismas dos trampas.
// ==========================================================================

/**
 * Anade la pagina nueva descartando lo que ya estuviera.
 *
 * El appendeo no perdona: cualquier solapamiento entre paginas duplica
 * elementos en la lista, y basta una peticion fuera de rango para que Kodi
 * devuelva de nuevo lo que ya se tenia.
 */
export function appendPage<T>(
  current: readonly T[],
  page: readonly T[],
  idOf: (item: T) => number
): T[] {
  const seen = new Set(current.map(idOf));

  return [...current, ...page.filter(item => !seen.has(idOf(item)))];
}
