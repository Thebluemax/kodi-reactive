import { buildPlan, diffFields, normalizeKey } from './media-import-matcher';
import {
  LibraryIndexItem,
  MatchBy,
  MediaImportEntry,
  MediaKind,
  UnmatchedReason
} from '../entities/media-import.entity';

function entry(partial: Partial<MediaImportEntry> = {}): MediaImportEntry {
  return {
    kind: MediaKind.Movie,
    matchBy: MatchBy.File,
    matchValue: 'smb://nas/cine/padrino.mkv',
    fields: { title: 'El Padrino' },
    index: 0,
    ...partial
  };
}

function item(partial: Partial<LibraryIndexItem> = {}): LibraryIndexItem {
  return {
    id: 11,
    kind: MediaKind.Movie,
    key: 'smb://nas/cine/padrino.mkv',
    label: 'El Padrino',
    current: { title: 'The Godfather' },
    ...partial
  };
}

describe('normalizeKey', () => {
  it('unifica los separadores de las rutas', () => {
    expect(normalizeKey(MediaKind.Movie, MatchBy.File, 'C:\\Cine\\a.mkv')).toBe(
      'c:/cine/a.mkv'
    );
  });

  it('ignora mayúsculas en las rutas', () => {
    expect(normalizeKey(MediaKind.Movie, MatchBy.File, 'SMB://NAS/A.MKV')).toBe(
      'smb://nas/a.mkv'
    );
  });

  it('separa los títulos por tipo de medio', () => {
    // Un album y un artista pueden llamarse igual y no son el mismo elemento.
    const album = normalizeKey(MediaKind.Album, MatchBy.Title, 'Radiohead');
    const artist = normalizeKey(MediaKind.Artist, MatchBy.Title, 'Radiohead');

    expect(album).not.toBe(artist);
  });

  it('colapsa los espacios de los títulos', () => {
    expect(normalizeKey(MediaKind.Album, MatchBy.Title, '  Kid   A ')).toBe(
      'album:kid a'
    );
  });
});

describe('diffFields', () => {
  it('solo devuelve lo que difiere', () => {
    const changes = diffFields({ title: 'A', year: 1972 }, { title: 'A', year: 1980 });

    expect(changes).toEqual([{ field: 'year', before: 1980, after: 1972 }]);
  });

  it('compara listas por contenido', () => {
    expect(diffFields({ genre: ['Drama'] }, { genre: ['Drama'] })).toEqual([]);
  });

  it('detecta el cambio de orden en una lista', () => {
    expect(diffFields({ genre: ['A', 'B'] }, { genre: ['B', 'A'] }).length).toBe(1);
  });

  it('trata ausente y vacío como lo mismo', () => {
    // Si Kodi no tiene el campo y el archivo lo trae vacio, no hay nada que
    // escribir: mandarlo seria una peticion inutil.
    expect(diffFields({ tagline: '' }, {})).toEqual([]);
    expect(diffFields({ genre: [] }, { genre: undefined })).toEqual([]);
  });

  it('compara los diccionarios de artwork por contenido', () => {
    expect(
      diffFields({ art: { poster: 'a' } }, { art: { poster: 'a' } })
    ).toEqual([]);

    expect(
      diffFields({ art: { poster: 'a' } }, { art: { poster: 'b' } }).length
    ).toBe(1);
  });

  it('no inventa cambios en campos que el archivo no trae', () => {
    expect(diffFields({ title: 'A' }, { title: 'A', plot: 'algo' })).toEqual([]);
  });
});

describe('buildPlan', () => {
  it('separa lo que cambia de lo que ya coincide', () => {
    const plan = buildPlan(
      [entry(), entry({ index: 1, matchValue: 'b.mkv', fields: { title: 'Igual' } })],
      [item(), item({ id: 12, key: 'b.mkv', current: { title: 'Igual' } })]
    );

    expect(plan.changed.length).toBe(1);
    expect(plan.unchanged.length).toBe(1);
  });

  it('lista lo que no encuentra en vez de ignorarlo', () => {
    const plan = buildPlan([entry({ matchValue: 'no-existe.mkv' })], [item()]);

    expect(plan.unmatched).toEqual([
      jasmine.objectContaining({ reason: UnmatchedReason.NotFound })
    ]);
  });

  it('no elige cuando hay varios candidatos', () => {
    // Esto reescribe fichas enteras: adivinar seria destructivo.
    const plan = buildPlan(
      [entry({ kind: MediaKind.Album, matchBy: MatchBy.Title, matchValue: 'Greatest Hits' })],
      [
        item({ id: 1, kind: MediaKind.Album, key: 'album:greatest hits', current: {} }),
        item({ id: 2, kind: MediaKind.Album, key: 'album:greatest hits', current: {} })
      ]
    );

    expect(plan.unmatched[0].reason).toBe(UnmatchedReason.Ambiguous);
    expect(plan.unmatched[0].candidates.length).toBe(2);
    expect(plan.changed).toEqual([]);
  });

  it('no confunde medios distintos con la misma clave', () => {
    const plan = buildPlan(
      [entry({ kind: MediaKind.Album, matchBy: MatchBy.Title, matchValue: 'Radiohead' })],
      [item({ kind: MediaKind.Artist, key: 'artist:radiohead', current: {} })]
    );

    expect(plan.unmatched[0].reason).toBe(UnmatchedReason.NotFound);
  });

  it('empareja pese a diferencias de mayúsculas y separadores', () => {
    const plan = buildPlan(
      [entry({ matchValue: 'SMB://NAS\\cine\\padrino.mkv' })],
      [item({ key: 'smb://nas/cine/padrino.mkv' })]
    );

    expect(plan.changed.length).toBe(1);
  });
});
