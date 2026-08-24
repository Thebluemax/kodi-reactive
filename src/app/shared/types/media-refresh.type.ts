// ==========================================================================
// SHARED TYPE - Media Refresh
// ==========================================================================
// Opciones de los VideoLibrary.Refresh*, que vuelven a pedir los datos al
// scraper en lugar de corregirlos a mano.
// https://kodi.wiki/view/JSON-RPC_API/v12
// ==========================================================================

export interface MediaRefreshOptions {
  /**
   * Titulo con el que buscar, en lugar de deducirlo del nombre o la ruta del
   * archivo. Es el remedio cuando el archivo esta mal nombrado, que es de donde
   * viene la mayoria de los datos equivocados.
   */
  readonly title?: string;
  /** Ignorar el NFO local, util cuando el NFO es justo lo que esta mal. */
  readonly ignoreNfo?: boolean;
  /** Solo para series: arrastrar el refresco a todos sus episodios. */
  readonly refreshEpisodes?: boolean;
}

/**
 * Compone el titulo con el que buscar. Los scrapers de Kodi entienden el año
 * entre parentesis, que es la convencion con la que Kodi parsea los nombres de
 * archivo, y sirve para separar dos peliculas homonimas.
 *
 * No es contrato de la API: RefreshMovie solo acepta `title`. Para desambiguar
 * con garantias esta el identificador unico.
 */
export function buildSearchTitle(title: string, year?: string): string {
  const cleanTitle = title.trim();
  const cleanYear = (year ?? '').trim();

  if (cleanTitle.length === 0 || cleanYear.length === 0) {
    return cleanTitle;
  }

  // Si el titulo ya lo trae, no se duplica.
  return cleanTitle.includes(`(${cleanYear})`)
    ? cleanTitle
    : `${cleanTitle} (${cleanYear})`;
}
