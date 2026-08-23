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
