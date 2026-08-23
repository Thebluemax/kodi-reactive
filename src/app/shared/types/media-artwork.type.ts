// ==========================================================================
// SHARED TYPE - Media Artwork
// ==========================================================================
// Espejo de Media.Artwork.Set de la API JSON-RPC de Kodi.
// https://kodi.wiki/view/JSON-RPC_API/v12
//
// Los valores son cadenas, no binarios: una URL o una ruta que Kodi pueda
// resolver, que el descarga y cachea en su Textures DB. La API no admite
// subir imagenes. `null` borra ese artwork.
//
// Las cuatro claves nombradas no son un cierre: el tipo declara
// additionalProperties, asi que clearlogo, clearart, discart o landscape
// tambien valen.
// ==========================================================================

export interface MediaArtworkSet {
  readonly banner?: string | null;
  readonly fanart?: string | null;
  readonly poster?: string | null;
  readonly thumb?: string | null;
  readonly [key: string]: string | null | undefined;
}
