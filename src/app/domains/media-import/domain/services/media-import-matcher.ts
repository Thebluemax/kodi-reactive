// ==========================================================================
// DOMAIN SERVICE - Media Import Matcher
// ==========================================================================
// Empareja las entradas del archivo con los elementos de la biblioteca y
// calcula que cambiaria. No escribe nada: produce el plan que se previsualiza.
// ==========================================================================

import {
  FieldChange,
  LibraryIndexItem,
  MatchBy,
  MediaImportEntry,
  MediaImportMatch,
  MediaImportPlan,
  MediaImportUnmatched,
  MediaKind,
  UnmatchedReason
} from '../entities/media-import.entity';

/**
 * Normaliza la clave de emparejado. Las rutas de Kodi llegan con separadores y
 * mayusculas inconsistentes segun el origen, y los titulos con espacios de mas.
 */
export function normalizeKey(kind: MediaKind, matchBy: MatchBy, value: string): string {
  const trimmed = value.trim();

  if (matchBy === MatchBy.File) {
    return trimmed.replace(/\\/g, '/').toLowerCase();
  }

  return `${kind}:${trimmed.toLowerCase().replace(/\s+/g, ' ')}`;
}

export function buildPlan(
  entries: readonly MediaImportEntry[],
  index: readonly LibraryIndexItem[]
): MediaImportPlan {
  const byKey = new Map<string, LibraryIndexItem[]>();

  for (const item of index) {
    const existing = byKey.get(item.key);
    if (existing) {
      existing.push(item);
    } else {
      byKey.set(item.key, [item]);
    }
  }

  const changed: MediaImportMatch[] = [];
  const unchanged: MediaImportMatch[] = [];
  const unmatched: MediaImportUnmatched[] = [];

  for (const entry of entries) {
    const key = normalizeKey(entry.kind, entry.matchBy, entry.matchValue);
    const candidates = (byKey.get(key) ?? []).filter(item => item.kind === entry.kind);

    if (candidates.length === 0) {
      unmatched.push({ entry, reason: UnmatchedReason.NotFound, candidates: [] });
      continue;
    }

    if (candidates.length > 1) {
      // Dos elementos con el mismo titulo: elegir uno seria adivinar, y esto
      // reescribe fichas enteras.
      unmatched.push({ entry, reason: UnmatchedReason.Ambiguous, candidates });
      continue;
    }

    const item = candidates[0];
    const changes = diffFields(entry.fields, item.current);
    const match: MediaImportMatch = { entry, item, changes };

    if (changes.length > 0) {
      changed.push(match);
    } else {
      unchanged.push(match);
    }
  }

  return { changed, unchanged, unmatched };
}

/**
 * Solo los campos que difieren. Un campo ausente del archivo no viaja: los
 * Set*Details tratan el parametro omitido como "no tocar", y la importacion
 * mantiene esa regla en vez de reescribir la ficha entera.
 */
export function diffFields(
  fields: Record<string, unknown>,
  current: Record<string, unknown>
): FieldChange[] {
  const changes: FieldChange[] = [];

  for (const [field, after] of Object.entries(fields)) {
    const before = current[field];

    if (!areEqual(before, after)) {
      changes.push({ field, before, after });
    }
  }

  return changes;
}

function areEqual(a: unknown, b: unknown): boolean {
  if (Array.isArray(a) && Array.isArray(b)) {
    return a.length === b.length && a.every((value, i) => areEqual(value, b[i]));
  }

  if (a === null || b === null || a === undefined || b === undefined) {
    // Ausente y vacio son lo mismo a efectos de "no hay nada que cambiar".
    return isEmpty(a) && isEmpty(b);
  }

  if (typeof a === 'object' && typeof b === 'object') {
    const left = a as Record<string, unknown>;
    const right = b as Record<string, unknown>;
    const keys = new Set([...Object.keys(left), ...Object.keys(right)]);

    return [...keys].every(key => areEqual(left[key], right[key]));
  }

  return a === b;
}

function isEmpty(value: unknown): boolean {
  return (
    value === null ||
    value === undefined ||
    value === '' ||
    (Array.isArray(value) && value.length === 0)
  );
}
