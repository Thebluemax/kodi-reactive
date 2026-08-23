// ==========================================================================
// SHARED TYPE - Media Edit Schema
// ==========================================================================
// Describe que campos de un medio son editables y como se presentan, para que
// el modal de edicion sea uno solo y cada medio aporte solo su declaracion.
//
// Los tipos salen del contrato de la API JSON-RPC de Kodi:
//   Optional.String            -> text | textarea
//   Optional.Integer | Number  -> number
//   Array.String               -> string-list
//   Optional.Boolean           -> boolean
//   enumerados cerrados        -> select
// ==========================================================================

export type MediaEditFieldKind =
  | 'text'
  | 'textarea'
  | 'number'
  | 'string-list'
  | 'boolean'
  | 'select';

/** Valores que un campo del formulario puede tomar. */
export type MediaEditValue = string | number | boolean | string[] | null | undefined;

export interface MediaEditOption {
  readonly value: string;
  readonly label: string;
}

export interface MediaEditField {
  /** Clave en el objeto de dominio y en el patch resultante. */
  readonly key: string;
  readonly label: string;
  readonly kind: MediaEditFieldKind;
  /** Texto de ayuda bajo el campo, para lo que la API no deja obvio. */
  readonly hint?: string;
  /** Solo para `select`. */
  readonly options?: readonly MediaEditOption[];
}

export type MediaEditSchema = readonly MediaEditField[];

/**
 * Patch resultante: solo las claves que el usuario cambio.
 *
 * Una clave ausente le dice a Kodi que no toque ese campo, y `null` borra el
 * valor. Los `Set*Details` distinguen ambos casos, asi que el modal tambien.
 */
export type MediaEditPatch = Record<string, MediaEditValue>;
