// ==========================================================================
// DOMAIN SERVICE - Media Import Parser (JSON)
// ==========================================================================
// Convierte el archivo en entradas normalizadas. No toca la biblioteca ni
// decide nada: solo lee, valida y localiza los problemas.
// ==========================================================================

import {
  MatchBy,
  MediaImportEntry,
  MediaImportIssue,
  MediaImportParseResult,
  MediaKind
} from '../entities/media-import.entity';

/** Claves que describen el elemento, no un campo a escribir. */
const CONTROL_KEYS = ['kind', 'file', 'match', 'title'] as const;

/** Medios sin `file` en la API: solo pueden emparejarse por titulo. */
const KINDS_WITHOUT_FILE: readonly MediaKind[] = [MediaKind.Album, MediaKind.Artist];

const KINDS = Object.values(MediaKind) as string[];

export function parseImportJson(text: string): MediaImportParseResult {
  let raw: unknown;

  try {
    raw = JSON.parse(text);
  } catch (error) {
    return {
      entries: [],
      issues: [
        {
          index: -1,
          message: `El archivo no es JSON válido: ${(error as Error).message}`
        }
      ]
    };
  }

  const list = Array.isArray(raw) ? raw : (raw as { items?: unknown })?.items;

  if (!Array.isArray(list)) {
    return {
      entries: [],
      issues: [
        {
          index: -1,
          message: 'Se esperaba una lista de entradas, o un objeto con la clave «items»'
        }
      ]
    };
  }

  const entries: MediaImportEntry[] = [];
  const issues: MediaImportIssue[] = [];

  list.forEach((item, index) => {
    const parsed = parseEntry(item, index);

    if ('message' in parsed) {
      issues.push({ index, message: parsed.message });
      return;
    }

    entries.push(parsed);
  });

  return { entries, issues };
}

function parseEntry(
  raw: unknown,
  index: number
): MediaImportEntry | { message: string } {
  if (raw === null || typeof raw !== 'object' || Array.isArray(raw)) {
    return { message: 'La entrada no es un objeto' };
  }

  const source = raw as Record<string, unknown>;
  const kind = String(source['kind'] ?? '').trim().toLowerCase();

  if (!KINDS.includes(kind)) {
    return {
      message: `«kind» debe ser uno de: ${KINDS.join(', ')}`
    };
  }

  const mediaKind = kind as MediaKind;
  const file = asText(source['file']);
  const title = asText(source['title']);

  if (file.length === 0 && title.length === 0) {
    return { message: 'Hace falta «file» o «title» para localizar el elemento' };
  }

  if (file.length > 0 && KINDS_WITHOUT_FILE.includes(mediaKind)) {
    return {
      message: `Kodi no expone la ruta de ${kind}: usa «title» para localizarlo`
    };
  }

  const fields = toFields(source);

  if (Object.keys(fields).length === 0) {
    return { message: 'La entrada no trae ningún campo que escribir' };
  }

  return {
    kind: mediaKind,
    matchBy: file.length > 0 ? MatchBy.File : MatchBy.Title,
    matchValue: file.length > 0 ? file : title,
    fields,
    index
  };
}

/**
 * Todo lo que no sea clave de control es un campo a escribir. `title` es las
 * dos cosas cuando se usa para localizar, asi que solo se descarta como campo
 * si no hay `file`: quien empareja por titulo no puede a la vez renombrarlo.
 */
function toFields(source: Record<string, unknown>): Record<string, unknown> {
  const usesTitleToMatch = asText(source['file']).length === 0;
  const fields: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(source)) {
    if ((CONTROL_KEYS as readonly string[]).includes(key)) {
      if (key === 'title' && !usesTitleToMatch) {
        fields[key] = value;
      }
      continue;
    }

    if (value !== undefined) {
      fields[key] = value;
    }
  }

  return fields;
}

function asText(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}
