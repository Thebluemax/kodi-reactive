// ==========================================================================
// DOMAIN SERVICE - Media Import Parser (NFO XML)
// ==========================================================================
// Lee el XML tipo NFO de Kodi y desemboca en la misma estructura que el JSON,
// para que el emparejado, el diff y el aplicado no sepan de donde vino.
//
// Un NFO describe un elemento, asi que un archivo puede traer uno solo o varios
// envueltos en una raiz cualquiera.
// ==========================================================================

import {
  MatchBy,
  MediaImportEntry,
  MediaImportIssue,
  MediaImportParseResult,
  MediaKind
} from '../entities/media-import.entity';

/** Etiqueta raiz de cada NFO -> tipo de medio. */
const ROOT_KINDS: Record<string, MediaKind> = {
  movie: MediaKind.Movie,
  tvshow: MediaKind.TVShow,
  album: MediaKind.Album,
  artist: MediaKind.Artist,
  song: MediaKind.Song
};

/** Etiquetas que se repiten y forman lista. */
const LIST_TAGS = ['genre', 'style', 'mood', 'theme', 'tag', 'studio', 'country',
  'director', 'writer', 'credits', 'showlink', 'artist', 'yearsactive'];

/** Etiqueta del NFO -> clave del dominio. */
const FIELD_NAMES: Record<string, string> = {
  originaltitle: 'originalTitle',
  sorttitle: 'sortTitle',
  plotoutline: 'plotOutline',
  userrating: 'userRating',
  imdbnumber: 'imdbNumber',
  episodeguide: 'episodeGuide',
  credits: 'writer',
  artist: 'artists',
  genre: 'genres',
  style: 'styles',
  mood: 'moods',
  theme: 'themes'
};

/** Claves cuyo nombre de dominio depende del medio. */
const FIELD_NAMES_BY_KIND: Partial<Record<MediaKind, Record<string, string>>> = {
  // En video la API llama `genre` y `tag` en singular; en musica, en plural.
  [MediaKind.Movie]: { genre: 'genre', studio: 'studio', tag: 'tag' },
  [MediaKind.TVShow]: { genre: 'genre', studio: 'studio', tag: 'tag' }
};

const NUMERIC_TAGS = ['year', 'runtime', 'rating', 'userrating', 'top250',
  'track', 'disc', 'duration', 'bpm'];

export function parseImportXml(text: string): MediaImportParseResult {
  const document = new DOMParser().parseFromString(text, 'application/xml');
  const failure = document.querySelector('parsererror');

  if (failure) {
    return {
      entries: [],
      issues: [{ index: -1, message: 'El archivo no es XML válido' }]
    };
  }

  const roots = collectRoots(document);

  if (roots.length === 0) {
    return {
      entries: [],
      issues: [
        {
          index: -1,
          message: `No se ha encontrado ningún elemento: se esperaba ${Object.keys(ROOT_KINDS).join(', ')}`
        }
      ]
    };
  }

  const entries: MediaImportEntry[] = [];
  const issues: MediaImportIssue[] = [];

  roots.forEach((root, index) => {
    const parsed = parseRoot(root, index);

    if ('message' in parsed) {
      issues.push({ index, message: parsed.message });
      return;
    }

    entries.push(parsed);
  });

  return { entries, issues };
}

function collectRoots(document: Document): Element[] {
  const root = document.documentElement;

  if (root && ROOT_KINDS[root.tagName.toLowerCase()]) {
    return [root];
  }

  const found: Element[] = [];

  for (const tag of Object.keys(ROOT_KINDS)) {
    found.push(...Array.from(document.getElementsByTagName(tag)));
  }

  return found;
}

function parseRoot(root: Element, index: number): MediaImportEntry | { message: string } {
  const kind = ROOT_KINDS[root.tagName.toLowerCase()];
  const file = textOf(root, 'file') || textOf(root, 'filenameandpath');
  const title = textOf(root, 'title') || textOf(root, 'name');

  if (file.length === 0 && title.length === 0) {
    return { message: 'Hace falta <file> o <title> para localizar el elemento' };
  }

  const matchesByFile = file.length > 0 && kind !== MediaKind.Album && kind !== MediaKind.Artist;
  const fields = toFields(root, kind, !matchesByFile);

  if (Object.keys(fields).length === 0) {
    return { message: 'El elemento no trae ningún campo que escribir' };
  }

  return {
    kind,
    matchBy: matchesByFile ? MatchBy.File : MatchBy.Title,
    matchValue: matchesByFile ? file : title,
    fields,
    index
  };
}

function toFields(
  root: Element,
  kind: MediaKind,
  usesTitleToMatch: boolean
): Record<string, unknown> {
  const fields: Record<string, unknown> = {};
  const overrides = FIELD_NAMES_BY_KIND[kind] ?? {};

  for (const child of Array.from(root.children)) {
    const tag = child.tagName.toLowerCase();

    if (tag === 'file' || tag === 'filenameandpath') {
      continue;
    }

    if ((tag === 'title' || tag === 'name') && usesTitleToMatch) {
      continue;
    }

    // Los hijos con estructura propia —actores, fanart, ratings— piden un
    // tratamiento que este parseo no da, y traducirlos a medias seria peor.
    if (child.children.length > 0) {
      continue;
    }

    const value = child.textContent?.trim() ?? '';

    if (value.length === 0) {
      continue;
    }

    const name = overrides[tag] ?? FIELD_NAMES[tag] ?? tag;

    if (LIST_TAGS.includes(tag)) {
      const list = (fields[name] as string[]) ?? [];
      fields[name] = [...list, value];
      continue;
    }

    fields[name] = NUMERIC_TAGS.includes(tag) ? Number(value) : value;
  }

  return fields;
}

function textOf(root: Element, tag: string): string {
  for (const child of Array.from(root.children)) {
    if (child.tagName.toLowerCase() === tag) {
      return child.textContent?.trim() ?? '';
    }
  }

  return '';
}
