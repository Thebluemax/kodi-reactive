// ==========================================================================
// DOMAIN ENTITY - File Item
// ==========================================================================
// Espejo de List.Item.File y List.Items.Sources de la API JSON-RPC de Kodi.
// https://kodi.wiki/view/JSON-RPC_API/v12
// ==========================================================================

/** Ventana de medios de Kodi cuyas fuentes se consultan. */
export enum FileMedia {
  Video = 'video',
  Music = 'music',
  Pictures = 'pictures',
  Files = 'files',
  Programs = 'programs'
}

export interface FileItem {
  /** Ruta de Kodi: smb://, nfs://, /home/..., segun la fuente. */
  readonly path: string;
  readonly label: string;
  readonly isDirectory: boolean;
  readonly mimeType: string;
}

export interface KodiFileResponse {
  file: string;
  label?: string;
  filetype?: 'file' | 'directory';
  mimetype?: string;
}

export class FileItemFactory {
  static fromKodiResponse(raw: KodiFileResponse): FileItem {
    return {
      path: raw.file,
      // Las fuentes no traen filetype y son siempre carpetas.
      label: raw.label || FileItemFactory.basename(raw.file),
      isDirectory: raw.filetype ? raw.filetype === 'directory' : true,
      mimeType: raw.mimetype || ''
    };
  }

  static fromKodiResponseList(rawList: KodiFileResponse[]): FileItem[] {
    return rawList.map(raw => FileItemFactory.fromKodiResponse(raw));
  }

  /** Ultimo tramo de la ruta, ignorando la barra final de las carpetas. */
  private static basename(path: string): string {
    const trimmed = path.replace(/[/\\]+$/, '');
    const separator = Math.max(trimmed.lastIndexOf('/'), trimmed.lastIndexOf('\\'));

    return separator >= 0 ? trimmed.slice(separator + 1) : trimmed;
  }
}
