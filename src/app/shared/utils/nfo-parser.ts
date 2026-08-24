// ==========================================================================
// SHARED - NFO Parser
// ==========================================================================
// Lee el XML tipo NFO de Kodi y devuelve los campos de un medio, con los
// nombres del dominio. Es el formato que muchos usuarios ya tienen en disco
// junto a sus archivos.
// ==========================================================================

export enum NfoKind {
  Movie = 'movie',
  TVShow = 'tvshow',
  Album = 'album',
  Artist = 'artist',
  Song = 'song'
}

export interface NfoParseResult {
  readonly kind: NfoKind;
  readonly fields: Record<string, unknown>;
}

const ROOT_KINDS: Record<string, NfoKind> = {
  movie: NfoKind.Movie,
  tvshow: NfoKind.TVShow,
  album: NfoKind.Album,
  artist: NfoKind.Artist,
  song: NfoKind.Song
};

/** Etiquetas que se repiten y forman lista. */
const LIST_TAGS = ['genre', 'style', 'mood', 'theme', 'tag', 'studio', 'country',
  'director', 'writer', 'credits', 'showlink', 'artist', 'yearsactive'];

const NUMERIC_TAGS = ['year', 'runtime', 'rating', 'userrating', 'top250',
  'track', 'disc', 'duration', 'bpm'];

/** Etiqueta del NFO -> clave del dominio, comun a todos los medios. */
const FIELD_NAMES: Record<string, string> = {
  originaltitle: 'originalTitle',
  sorttitle: 'sortTitle',
  plotoutline: 'plotOutline',
  userrating: 'userRating',
  imdbnumber: 'imdbNumber',
  episodeguide: 'episodeGuide',
  credits: 'writer',
  sortname: 'sortName',
  releasedate: 'releaseDate',
  originaldate: 'originalDate',
  disctitle: 'discTitle',
  displayartist: 'displayArtist',
  sortartist: 'sortArtist',
  name: 'name'
};

/**
 * En video las entidades usan el singular —`genre`, `tag`, `studio`— y en
 * musica el plural. La API arrastra la misma inconsistencia, asi que la
 * traduccion depende del medio.
 */
const MUSIC_FIELD_NAMES: Record<string, string> = {
  genre: 'genres',
  style: 'styles',
  mood: 'moods',
  theme: 'themes',
  artist: 'artists',
  instrument: 'instruments',
  yearsactive: 'yearsActive',
  albumlabel: 'label'
};

const MUSIC_KINDS: readonly NfoKind[] = [NfoKind.Album, NfoKind.Artist, NfoKind.Song];

/** `null` si el archivo no es un NFO reconocible. */
export function parseNfo(text: string): NfoParseResult | null {
  const document = new DOMParser().parseFromString(text, 'application/xml');

  if (document.querySelector('parsererror')) {
    return null;
  }

  const root = document.documentElement;
  const kind = root ? ROOT_KINDS[root.tagName.toLowerCase()] : undefined;

  if (!kind) {
    return null;
  }

  return { kind, fields: toFields(root, kind) };
}

/** Primer caracter significativo: `<` es XML, cualquier otra cosa se lee como JSON. */
export function looksLikeXml(text: string): boolean {
  return /^\s*</.test(text);
}

function toFields(root: Element, kind: NfoKind): Record<string, unknown> {
  const fields: Record<string, unknown> = {};
  const isMusic = MUSIC_KINDS.indexOf(kind) >= 0;

  for (const child of Array.from(root.children)) {
    const tag = child.tagName.toLowerCase();

    // Los hijos con estructura propia —reparto, ratings, fanart— piden un
    // tratamiento que este parseo no da, y traducirlos a medias seria peor.
    if (child.children.length > 0) {
      continue;
    }

    const value = child.textContent?.trim() ?? '';

    if (value.length === 0) {
      continue;
    }

    const name = (isMusic ? MUSIC_FIELD_NAMES[tag] : undefined) ?? FIELD_NAMES[tag] ?? tag;

    if (LIST_TAGS.indexOf(tag) >= 0) {
      const list = (fields[name] as string[]) ?? [];
      fields[name] = [...list, value];
      continue;
    }

    fields[name] = NUMERIC_TAGS.indexOf(tag) >= 0 ? Number(value) : value;
  }

  return fields;
}
