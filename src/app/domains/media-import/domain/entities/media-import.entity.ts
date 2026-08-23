// ==========================================================================
// DOMAIN ENTITY - Media Import
// ==========================================================================
// Estructura comun a la que desembocan todos los formatos de importacion. El
// parseo de cada formato produce esto; el emparejado y el diff no saben de
// donde vino.
// ==========================================================================

export enum MediaKind {
  Movie = 'movie',
  TVShow = 'tvshow',
  Album = 'album',
  Artist = 'artist',
  Song = 'song'
}

/**
 * Como se localiza el elemento en la biblioteca.
 *
 * La ruta del archivo es la clave fiable, pero album y artista no la tienen:
 * Audio.Fields.Album y Audio.Fields.Artist no declaran `file`. Para esos solo
 * queda el titulo, que es ambiguo y obliga a avisar de las coincidencias
 * multiples en vez de elegir una.
 */
export enum MatchBy {
  File = 'file',
  Title = 'title'
}

/** Una entrada del archivo, ya normalizada. */
export interface MediaImportEntry {
  readonly kind: MediaKind;
  readonly matchBy: MatchBy;
  /** Ruta del archivo o titulo, segun `matchBy`. */
  readonly matchValue: string;
  /** Campos a escribir, en el vocabulario del dominio de cada medio. */
  readonly fields: Record<string, unknown>;
  /** Posicion en el archivo, para poder senalar donde esta el problema. */
  readonly index: number;
}

/** Un problema localizado en el archivo, que no aborta el resto del parseo. */
export interface MediaImportIssue {
  readonly index: number;
  readonly message: string;
}

export interface MediaImportParseResult {
  readonly entries: MediaImportEntry[];
  readonly issues: MediaImportIssue[];
}

/** Elemento de la biblioteca contra el que se empareja. */
export interface LibraryIndexItem {
  readonly id: number;
  readonly kind: MediaKind;
  /** Clave de emparejado ya normalizada. */
  readonly key: string;
  readonly label: string;
  /** Valores actuales, para calcular el diff. */
  readonly current: Record<string, unknown>;
}

export interface FieldChange {
  readonly field: string;
  readonly before: unknown;
  readonly after: unknown;
}

/** Una entrada emparejada con su elemento, y lo que cambiaria. */
export interface MediaImportMatch {
  readonly entry: MediaImportEntry;
  readonly item: LibraryIndexItem;
  readonly changes: FieldChange[];
}

export enum UnmatchedReason {
  NotFound = 'not-found',
  Ambiguous = 'ambiguous'
}

export interface MediaImportUnmatched {
  readonly entry: MediaImportEntry;
  readonly reason: UnmatchedReason;
  /** Candidatos cuando la coincidencia es ambigua. */
  readonly candidates: LibraryIndexItem[];
}

export interface MediaImportPlan {
  /** Emparejadas y con algo que cambiar. */
  readonly changed: MediaImportMatch[];
  /** Emparejadas pero identicas: no se tocan. */
  readonly unchanged: MediaImportMatch[];
  readonly unmatched: MediaImportUnmatched[];
}
